import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateAccountInput } from './dto/create-account.dto'
import { User } from './entities/user.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly user: Repository<User>,
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
}
