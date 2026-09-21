import { DribbbleLogo } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'

export default function Brand({ light = false }) {
  return (
    <Link className={`brand ${light ? 'brand-light' : ''}`} to="/" aria-label="SportHub - Trang chủ">
      <DribbbleLogo size={24} weight="regular" />
      <span>SportHub</span>
    </Link>
  )
}
