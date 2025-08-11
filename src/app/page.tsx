import { redirect } from 'next/navigation'

export default function Home() {
  // 重定向到默认空间
  redirect('/space/default')
}