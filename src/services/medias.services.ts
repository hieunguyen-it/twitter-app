import { Request } from 'express'
import { getNameFromFullname, getNameVideoHLSPath, handleUploadImage, handleUploadVideo } from '~/utils/file'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import fs from 'fs'
import { envConfig, isProduction } from '~/constants/config'
import { EncodingStatus, MediaType } from '~/constants/enum'
import { Media } from '~/models/Other'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import fsPromise from 'fs/promises'
import databaseService from './database.services'
import VideoStatus from '~/models/schemas/VideoStatus.schema'

class Queue {
  items: string[]
  encoding: boolean
  constructor() {
    this.items = []
    this.encoding = false
  }
  async enqueue(item: string) {
    this.items.push(item)
    const idName = getNameVideoHLSPath(item)
    await databaseService.videoStatus.insertOne(
      new VideoStatus({
        name: idName,
        status: EncodingStatus.Pending
      })
    )
    this.processEncode()
  }
  async processEncode() {
    if (this.encoding) return
    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0]

      const idName = getNameVideoHLSPath(videoPath)
      await databaseService.videoStatus.updateOne(
        { name: idName },
        {
          $set: {
            status: EncodingStatus.Processing
          },
          $currentDate: {
            updated_at: true
          }
        }
      )

      try {
        await encodeHLSWithMultipleVideoStreams(videoPath)
        this.items.shift()
        await fsPromise.unlink(videoPath)
        const idName = getNameVideoHLSPath(videoPath)
        await databaseService.videoStatus.updateOne(
          { name: idName },
          {
            $set: {
              status: EncodingStatus.Success
            },
            $currentDate: {
              updated_at: true
            }
          }
        )
        console.log(`Encode video ${videoPath} success`)
      } catch (error) {
        await databaseService.videoStatus
          .updateOne(
            { name: idName },
            {
              $set: {
                status: EncodingStatus.Failed
              },
              $currentDate: {
                updated_at: true
              }
            }
          )
          .catch((err) => {
            console.error('Update video status error')
          })
        console.error(`Encode video ${videoPath} error`)
        console.error(error)
      }
      this.encoding = false
      this.processEncode()
    } else {
      console.log('Encode video queue is empty')
    }
  }
}

const queue = new Queue()

class MediasServices {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        const newPath = UPLOAD_IMAGE_DIR + `/${newName}.jpg`
        // Tối ưu performance của ảnh khi upload lên server dùng sharp
        // Chuyển đổi ảnh upload lên sang jpeg để có khả năng nén tốt hơn
        // Loại bỏ đi thông tin metadata của ảnh không cần thiết đi
        // thường kích thước sẽ giảm đi được 1 nửa so với dung lượng file ban đầu
        await sharp(file.filepath).jpeg().toFile(newPath)

        // Xóa file uploads/temp sau khi upload
        fs.unlinkSync(file.filepath)

        return {
          url: isProduction
            ? `${envConfig.host}/static/image/${newName}.jpg`
            : `http://localhost:${envConfig.port}/static/image/${newName}.jpg`,
          type: MediaType.Image
        }
      })
    )
    return result
  }

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)

    const result: Media[] = files.map((file) => {
      return {
        url: isProduction
          ? `${envConfig.host}/static/video/${file.newFilename}`
          : `http://localhost:${envConfig.port}/static/video/${file.newFilename}`,
        type: MediaType.Video
      }
    })

    return result
  }

  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideo(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        queue.enqueue(file.filepath)
        return {
          url: isProduction
            ? `${envConfig.host}/static/video-hls/${file.newFilename}.m3u8`
            : `http://localhost:${envConfig.port}/static/video-hls/${file.newFilename}.m3u8`,
          type: MediaType.HLS
        }
      })
    )

    return result
  }

  async getVideoStatus(id: string) {
    const data = await databaseService.videoStatus.findOne({ name: id })
    return data
  }
}

const mediasServices = new MediasServices()
export default mediasServices
