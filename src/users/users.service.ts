import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateAccountInput } from './dtos/create-account.dto'
import { LoginInput, LoginOutput } from './dtos/login.dto'
import { User } from './entities/user.entity'
import * as jwt from 'jsonwebtoken'
import { ConfigService } from '@nestjs/config'
import { JwtService } from 'src/jwt/jwt.service'
import { EditProfileInput } from './dtos/edit-profile.dto'
import { Verification } from './entities/verification.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly user: Repository<User>,
    @InjectRepository(Verification)
    private readonly verification: Repository<Verification>,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    // check new user
    try {
      const exists = await this.user.findOne({ email })
      if (exists) {
        // make error
        return { ok: false, error: 'There is a user with that email already.' }
      }
      // create user & hash the password
      const user = await this.user.save(
        this.user.create({ email, password, role }),
      )
      await this.verification.save(this.verification.create({ user }))
      return { ok: true }
    } catch (e) {
      return { ok: false, error: "Couldn't create account" }
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.user.findOne(
        { email },
        { select: ['id', 'password'] },
      )
      // find user with email
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        }
      }
      // check if password is correct
      const isCorrectPassword = await user.checkPassword(password)
      if (!isCorrectPassword) {
        return {
          ok: false,
          error: 'Wrong password',
        }
      }
      // make JWT
      const token = this.jwtService.sign(user.id)
      return {
        ok: true,
        token,
      }
    } catch (error) {
      return {
        ok: false,
        error,
      }
    }
  }

  async findById(id: number): Promise<User> {
    return this.user.findOne({ id })
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<User> {
    const user = await this.user.findOne({ id: userId })
    if (email) {
      user.email = email
      user.verified = false
      await this.verification.save(this.verification.create({ user }))
    }
    if (password) {
      user.password = password
    }

    return this.user.save(user)
  }

  async verifyEmail(code: string): Promise<boolean> {
    try {
      const verification = await this.verification.findOne(
        { code },
        { relations: ['user'] },
      )
      if (verification) {
        verification.user.verified = true
        await this.user.save(verification.user)

        return true
      }
      throw new Error()
    } catch (error) {
      console.log(error)
      return false
    }
  }
}
