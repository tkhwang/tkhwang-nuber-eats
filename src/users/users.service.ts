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
  }: CreateAccountInput): Promise<string | undefined> {
    // check new user
    try {
      const exists = await this.user.findOne({ email })
      if (exists) {
        // make error
        return 'There is a user with that email already.'
      }
      // create user & hash the password
      await this.user.save(this.user.create({ email, password, role }))
    } catch (e) {
      return "Couldn't create account"
    }
  }
}
