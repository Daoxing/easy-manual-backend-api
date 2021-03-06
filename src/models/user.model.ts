import {
  defaultPage,
  defaultSort,
  TABLE_USER,
  TABLE_USER_IN_GROUP,
} from '../constants';
import { DBconnection } from '../database';
import {
  IOrder,
  IPage,
  LoginByEmail,
  LoginByPhoneNbr,
  NewUser,
  UpdateUserInfo,
  usernameInfo,
} from '../types';
import { generateRandomDigitalNumbers } from '../utils';

const getUserInGroup = (userId: string, groupId: string) => {
  return DBconnection.select(`${TABLE_USER}.*`)
    .from(TABLE_USER_IN_GROUP)
    .leftJoin(
      TABLE_USER,
      `${TABLE_USER_IN_GROUP}.user_id`,
      `${TABLE_USER}.user_id`,
    )
    .whereRaw(
      `${TABLE_USER_IN_GROUP}.group_id = ? AND ${TABLE_USER_IN_GROUP}.user_id = ?`,
      [groupId, userId],
    )
    .first();
};

const findUsersInGroupByName = (name: string, groupId: string) => {
  return DBconnection.select(`${TABLE_USER}.*`)
    .from(TABLE_USER_IN_GROUP)
    .leftJoin(
      TABLE_USER,
      `${TABLE_USER_IN_GROUP}.user_id`,
      `${TABLE_USER}.user_id`,
    )
    .where({ group_id: groupId })
    .andWhereRaw(`POSITION( LOWER(${name}) IN LOWER(${TABLE_USER}.user_nme))>0`)
    .orderBy(`${TABLE_USER}.user_nme`, 'asc');
};

const findUserById = async (userId: string) => {
  return DBconnection(TABLE_USER)
    .where({ user_id: userId })
    .select('*')
    .first();
};
const findUsersInGroup = async (
  groupId: string,
  order: IOrder = defaultSort,
  page: IPage = defaultPage,
) => {
  order = order ? order : defaultSort;
  page = page ? page : defaultPage;
  return DBconnection.select(`${TABLE_USER}.*`)
    .from(TABLE_USER)
    .leftJoin(
      TABLE_USER_IN_GROUP,
      `${TABLE_USER_IN_GROUP}.user_id`,
      `${TABLE_USER}.user_id`,
    )
    .where(DBconnection.raw(`${TABLE_USER_IN_GROUP}.group_id = '${groupId}'`))
    .orderBy(order.field, order.order)
    .limit(page.pageCount)
    .offset(page.pageCount * (page.pageNo - 1));
};
const findUsersCountInGroup = async (groupId: string) => {
  const res = await DBconnection.from(TABLE_USER)
    .leftJoin(
      TABLE_USER_IN_GROUP,
      `${TABLE_USER_IN_GROUP}.user_id`,
      `${TABLE_USER}.user_id`,
    )
    .where(DBconnection.raw(`${TABLE_USER_IN_GROUP}.group_id = '${groupId}'`))
    .count();
  return res[0].count;
};

const findUsersByNames = (name: string) => {
  return DBconnection.select('*')
    .from(TABLE_USER)
    .whereRaw(`POSITION( LOWER(${name}) IN LOWER(user_nme))>0`)
    .orderBy(`user_nme`, 'asc');
};

const verifyCode = (userId: string, code: string) => {
  return DBconnection(TABLE_USER)
    .where({ user_id: userId, verify_code: code })
    .select('*')
    .first();
};

const clearVerifyCode = (userId: string, code: string) => {
  const codeUpdate = {
    verify_code: null,
    verify_code_created_tms: null,
  };
  return DBconnection(TABLE_USER)
    .where({ user_id: userId, verify_code: code })
    .update(codeUpdate)
    .returning('*');
};

const findLoginUser = (accountInfo: LoginByEmail | LoginByPhoneNbr) => {
  return DBconnection(TABLE_USER).where(accountInfo).select('*').first();
};

const findOtherUsersByUniqueInfo = (
  accountInfo: LoginByEmail | LoginByPhoneNbr | usernameInfo,
  requestUserId: string,
) => {
  return DBconnection(TABLE_USER)
    .where(accountInfo)
    .andWhereNot({ user_id: requestUserId })
    .select('*')
    .first();
};

const updateUserInfo = (userInfo: UpdateUserInfo, requestUserId: string) => {
  return DBconnection(TABLE_USER)
    .where({ user_id: requestUserId })
    .update(userInfo)
    .returning('*');
};

const insertUser = (accountInfo: NewUser) => {
  return DBconnection(TABLE_USER).insert(accountInfo).returning('*');
};

const updateVerifyCodeForLoginUser = (
  accountInfo: LoginByEmail | LoginByPhoneNbr,
) => {
  const phoneNbrCodeUpdate = {
    verify_code: generateRandomDigitalNumbers(6),
    verify_code_created_tms: new Date(),
  };
  return DBconnection(TABLE_USER)
    .where(accountInfo)
    .update(phoneNbrCodeUpdate)
    .returning('*');
};

export const UserModel = {
  getUserInGroup,
  findUserById,
  findUsersInGroupByName,
  findUsersByNames,
  verifyCode,
  clearVerifyCode,
  findLoginUser,
  findOtherUsersByUniqueInfo,
  insertUser,
  updateVerifyCodeForLoginUser,
  updateUserInfo,
  findUsersInGroup,
  findUsersCountInGroup,
};
