import { Request } from 'express'
import { getNameFromFullname, handleUploadImage, handleUploadVideo } from '~/utils/file'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { MediaType } from '~/constants/enum'
import { Media } from '~/models/Other'
config()

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
            ? `${process.env.HOST}/static/image/${newName}.jpg`
            : `http://localhost:${process.env.PORT}/static/image/${newName}.jpg`,
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
          ? `${process.env.HOST}/static/video/${file.newFilename}`
          : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
        type: MediaType.Video
      }
    })

    return result
  }
}

const mediasServices = new MediasServices()
export default mediasServices
