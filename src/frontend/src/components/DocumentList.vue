import { defineComponent, type PropType } from 'vue'

export interface FileItem {
  id: string
  name: string
  url: string
  extension: string
  size: number
  type: 'file' | 'folder'
  children?: FileItem[]
}

export interface DocumentListProps {
  title?: string
  files: FileItem[]
}

export default defineComponent({
  name: 'DocumentList',
  props: {
    title: {
      type: String,
      default: ''
    },
    files: {
      type: Array as PropType<FileItem[]>,
      required: true
    }
  },
  methods: {
    formatFileSize(bytes: number): string {
      if (bytes === 0) return '0 Bytes'
      
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    getFileIcon(extension: string): string {
      const iconMap: Record<string, string> = {
        pdf: 'icon-file-pdf',
        doc: 'icon-file-word',
        docx: 'icon-file-word',
        xls: 'icon-file-excel',
        xlsx: 'icon-file-excel',
        ppt: 'icon-file-powerpoint',
        pptx: 'icon-file-powerpoint',
        txt: 'icon-file-text',
        zip: 'icon-file-zip',
        rar: 'icon-file-zip',
        jpg: 'icon-picture',
        jpeg: 'icon-picture',
        png: 'icon-picture',
        gif: 'icon-picture',
        svg: 'icon-picture',
        mp4: 'icon-video',
        avi: 'icon-video',
        mov: 'icon-video',
        mp3: 'icon-music',
        wav: 'icon-music',
        folder: 'icon-folder'
      }
      
      return iconMap[extension.toLowerCase()] || 'icon-document'
    },
    
    downloadFile(file: FileItem): void {
      if (file.type === 'file') {
        window.open(file.url, '_blank')
      }
    }
  }
})
