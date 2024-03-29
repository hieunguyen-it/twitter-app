import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  // Check uploads folder đã tồn tại chưa
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      // Nếu chưa thì tạo mới thư mục uploads
      fs.mkdirSync(dir, {
        recursive: true // Mục đích tạo folder nested
      })
    }
  })
}

export const handleUploadImage = async (req: Request) => {
  // path.resolve('uploads'): Khi upload file, tạo thư mục uploads trong thư mục root
  // keepExtensions file mở rộng
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 3000 * 1024, // 3000kb
    maxTotalFileSize: 3000 * 1024 * 4,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      // Check nếu key gửi lên không phải là image thì báo lỗi
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // Check nếu không gửi ảnh báo lỗi
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new Error('File is empty'))
      }
      resolve(files.image as File[])
    })
  })
}

// Cách xử lý khi upload video và encode
// Có 2 giai đoạn
// Upload video: Upload video thành công thì resolve về cho người dùng
// Encode video: Khai báo thêm 1 url endpoint để check xem cái video đó đã encode xong chưa

export const handleUploadVideo = async (req: Request) => {
  // Cách để có được định dạng idname/idname.mp4
  // ✅Cách 1: Tạo unique id cho video ngay từ đầu
  // ❌Cách 2: Đợi video upload xong rồi tạo folder, move video vào

  const nanoId = (await import('nanoid')).nanoid
  const idName = nanoId()

  const folderPath = path.resolve(UPLOAD_VIDEO_DIR, idName)
  fs.mkdirSync(folderPath)
  const form = formidable({
    uploadDir: folderPath,
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024, // 50mb
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = (name === 'video' && Boolean(mimetype?.includes('mp4'))) || Boolean(mimetype?.includes('quicktime'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    },
    filename: function (ext) {
      return idName
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.video)) {
        return reject(new Error('File is empty'))
      }
      resolve(files.video as File[])
    })
  })
}

export const getNameFromFullname = (fullname: string) => {
  const namearr = fullname.split('.')
  namearr.pop()
  return namearr.join('')
}

export const getNameVideoHLSPath = (path: string) => {
  const pathArray = path.split('/')

  // Lấy phần tử cuối cùng trong mảng, đó chính là chuỗi cần tìm
  const lastElement = pathArray[pathArray.length - 1]

  return lastElement
}
