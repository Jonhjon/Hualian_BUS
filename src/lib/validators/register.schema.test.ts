import { step1Schema, step2Schema, step3Schema, registerApiSchema } from './register.schema'

describe('step1Schema', () => {
  const valid = { username: 'user01', password: 'password123', confirmPassword: 'password123' }

  it('accepts valid credentials', () => {
    expect(step1Schema.safeParse(valid).success).toBe(true)
  })

  it('rejects username shorter than 4 chars', () => {
    expect(step1Schema.safeParse({ ...valid, username: 'ab' }).success).toBe(false)
  })

  it('rejects username with special chars', () => {
    expect(step1Schema.safeParse({ ...valid, username: 'user@name' }).success).toBe(false)
  })

  it('rejects password shorter than 8 chars', () => {
    expect(step1Schema.safeParse({ ...valid, password: '1234567', confirmPassword: '1234567' }).success).toBe(false)
  })

  it('rejects mismatched passwords', () => {
    const result = step1Schema.safeParse({ ...valid, confirmPassword: 'different' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors
      expect(fields.confirmPassword).toBeDefined()
    }
  })
})

describe('step2Schema', () => {
  const valid = {
    realName: '王小明',
    identityNo: 'A123456789',
    gender: '男' as const,
    identityType: 1 as const,
    birthDate: '1990-01-01',
    expiryDate: '2030-12-31',
    disabilityLevel: '中度',
    assistiveDevice: '輪椅',
    address: '花蓮縣花蓮市中正路1號',
  }

  it('accepts valid profile data', () => {
    expect(step2Schema.safeParse(valid).success).toBe(true)
  })

  it('rejects invalid Taiwan ID', () => {
    expect(step2Schema.safeParse({ ...valid, identityNo: 'A123456788' }).success).toBe(false)
  })

  it('rejects missing realName', () => {
    expect(step2Schema.safeParse({ ...valid, realName: '' }).success).toBe(false)
  })

  it('rejects missing birthDate', () => {
    expect(step2Schema.safeParse({ ...valid, birthDate: '' }).success).toBe(false)
  })

  it('rejects birthDate later than today', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const future = tomorrow.toISOString().slice(0, 10)
    const result = step2Schema.safeParse({ ...valid, birthDate: future })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors
      expect(fields.birthDate).toBeDefined()
    }
  })

  it('accepts birthDate equal to today', () => {
    const today = new Date().toISOString().slice(0, 10)
    expect(step2Schema.safeParse({ ...valid, birthDate: today }).success).toBe(true)
  })

  it('rejects missing expiryDate', () => {
    expect(step2Schema.safeParse({ ...valid, expiryDate: '' }).success).toBe(false)
  })

  it('rejects CMS level when identityType is 1 (復康)', () => {
    const result = step2Schema.safeParse({
      ...valid,
      identityType: 1,
      disabilityLevel: 'CMS 第3級',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors
      expect(fields.disabilityLevel).toBeDefined()
    }
  })

  it('accepts CMS level when identityType is 2 (長照)', () => {
    const result = step2Schema.safeParse({
      ...valid,
      identityType: 2,
      disabilityLevel: 'CMS 第3級',
    })
    expect(result.success).toBe(true)
  })

  it('rejects 中度 when identityType is 2 (長照)', () => {
    const result = step2Schema.safeParse({
      ...valid,
      identityType: 2,
      disabilityLevel: '中度',
    })
    expect(result.success).toBe(false)
  })

  it('rejects CMS 第9級 (out of range) when identityType is 2', () => {
    const result = step2Schema.safeParse({
      ...valid,
      identityType: 2,
      disabilityLevel: 'CMS 第9級',
    })
    expect(result.success).toBe(false)
  })
})

describe('step3Schema', () => {
  const valid = {
    applicantName: '王大明',
    relationType: '子女' as const,
    email: 'user@example.com',
    phone: '0912345678',
  }

  it('accepts valid applicant contact data', () => {
    expect(step3Schema.safeParse(valid).success).toBe(true)
  })

  it('rejects missing applicant name', () => {
    expect(step3Schema.safeParse({ ...valid, applicantName: '' }).success).toBe(false)
  })

  it('rejects invalid email', () => {
    expect(step3Schema.safeParse({ ...valid, email: 'not-email' }).success).toBe(false)
  })

  it('rejects invalid phone', () => {
    expect(step3Schema.safeParse({ ...valid, phone: 'abc' }).success).toBe(false)
  })

  it('rejects invalid relationType', () => {
    expect(step3Schema.safeParse({ ...valid, relationType: '朋友' }).success).toBe(false)
  })
})

describe('registerApiSchema', () => {
  it('accepts complete valid payload', () => {
    const payload = {
      username: 'testuser',
      password: 'password123',
      realName: '王小明',
      identityNo: 'A123456789',
      gender: '男',
      identityType: 1,
      birthDate: '1990-01-01',
      expiryDate: '2030-12-31',
      disabilityLevel: '中度',
      assistiveDevice: '輪椅',
      address: '花蓮縣花蓮市中正路1號',
      applicantName: '王大明',
      relationType: '子女',
      email: 'user@example.com',
      phone: '0912345678',
    }
    expect(registerApiSchema.safeParse(payload).success).toBe(true)
  })
})
