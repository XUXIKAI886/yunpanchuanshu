export interface FileInfo {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: Date
  downloadUrl: string
  spaceId: string
}

export interface SpaceInfo {
  id: string
  totalFiles: number
  totalSize: number
  lastModified: Date
}

export interface UploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export type SortField = 'name' | 'size' | 'uploadedAt'
export type SortDirection = 'asc' | 'desc'

export interface FileListFilter {
  search?: string
  sortBy?: SortField
  sortDirection?: SortDirection
}