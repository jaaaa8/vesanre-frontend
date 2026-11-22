import { ALL_FIELDS } from '../../utils/providerRules'

export const VENUE_LABELS = {
  name: 'Tên cơ sở',
  addressLine: 'Địa chỉ',
  ward: 'Phường/Xã',
  district: 'Quận/Huyện',
  city: 'Thành phố',
  province: 'Tỉnh',
  postalCode: 'Mã bưu chính',
  latitude: 'Vĩ độ',
  longitude: 'Kinh độ',
  phone: 'Số điện thoại',
  description: 'Mô tả',
}

export const MAX = { name: 160, addressLine: 255, ward: 120, district: 120, city: 120, province: 120, postalCode: 20, phone: 32, description: 5000 }
export const REQUIRED = new Set(['name', 'addressLine', 'district', 'city'])

export const EMPTY_VENUE = Object.fromEntries(ALL_FIELDS.map((k) => [k, '']))

export const venueToForm = (venue) => Object.fromEntries(ALL_FIELDS.map((k) => [k, venue[k] == null ? '' : String(venue[k])]))
