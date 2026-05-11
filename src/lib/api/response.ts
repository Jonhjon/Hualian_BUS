import { NextResponse } from 'next/server'

function bigintReplacer(_: string, value: unknown) {
  return typeof value === 'bigint' ? value.toString() : value
}

function serialize<T>(data: T): unknown {
  return JSON.parse(JSON.stringify(data, bigintReplacer))
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data: serialize(data) }, { status })
}

export function okPage<T>(data: T, meta: { total: number; page: number; limit: number }) {
  return NextResponse.json({ success: true, data: serialize(data), meta })
}

export function err(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status })
}
