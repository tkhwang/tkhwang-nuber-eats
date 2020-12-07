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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly user: Repository<User>,
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
      await this.user.save(this.user.create({ email, password, role }))
      return { ok: true }
    } catch (e) {
      return { ok: false, error: "Couldn't create account" }
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.user.findOne({ email })
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

  async editProfile(userId: number, editProfileInput: EditProfileInput) {
    return this.user.update(userId, { ...editProfileInput })
  }
}
