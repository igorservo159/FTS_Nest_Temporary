import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import firebaseAdminApp from 'firebase.initialization';

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }

  async getUserByUid(uid: string) {
    try {
      const userRecord = await firebaseAdminApp.auth().getUser(uid);

      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      };
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        throw new NotFoundException('Usuário não encontrado');
      }
      throw error;
    }
  }

  async getAllUsers() {
    const listAllUsers = async (nextPageToken?) => {
      const listUsersResult = await firebaseAdminApp
        .auth()
        .listUsers(1000, nextPageToken);
      if (nextPageToken)
        return listUsersResult.users
          .map((userRecord) => userRecord.toJSON())
          .concat(listAllUsers(nextPageToken));
      return listUsersResult.users.map((userRecord) => ({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      }));
    };

    return await listAllUsers();
  }
  async createUserInFirebase(createUserDto: CreateUserDto) {
    const user = {
      ...createUserDto,
      emailVerified: false,
      disabled: false,
    };
    try {
      const userRecord = await firebaseAdminApp.auth().createUser(user);
      console.log('Successfully created new user:', userRecord.uid);
      return userRecord;
    } catch (error) {
      console.log('Error creating new user:', error);
    }
  }
}
