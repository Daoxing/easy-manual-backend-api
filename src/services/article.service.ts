import validator from 'validator';
import { message } from '../constants';
import { specialRegex } from '../constants/common';
import { ArticleModel, UserModel } from '../models';
import { GroupModel } from '../models/group.model';
import {
  IArticle,
  ICreateArticleInput,
  IRequestingUser,
  IUpdateArticleInput,
} from '../types';

// Query
const getArticleById = async (
  articleId: string,
  requestingUser: IRequestingUser,
) => {
  const article: IArticle = await ArticleModel.getArticleById(articleId);
  if (!article) {
    throw new Error(message.NOT_FOUND_ARTICLE);
  }
  if (article.only_me && article.created_user_id !== requestingUser.user_id) {
    throw new Error(message.NOT_FOUND_ARTICLE);
  }
  if (article.group_id) {
    const user = await UserModel.getUserInGroup(
      requestingUser.user_id,
      article.group_id,
    );
    if (!user) {
      throw new Error(message.NO_PERMISSION);
    }
  }
};

// Create
const createArticle = async (
  articleInfo: ICreateArticleInput,
  requestingUser: IRequestingUser,
) => {
  let { article_nme, group_id, article_content, only_me } = articleInfo;
  article_nme = article_nme.replace(specialRegex, '');
  if (article_nme.length === 0) {
    throw new Error(message.INVALID_INPUT);
  }
  if (group_id && validator.isUUID(group_id)) {
    const findGroup = await GroupModel.getGroupById(group_id);
    if (!findGroup) {
      throw new Error(message.NOT_FOUND_GROUP);
    }
  } else {
    group_id = null;
  }
  only_me = !!only_me;

  const createResult = await ArticleModel.createArticle({
    article_nme,
    group_id,
    created_user_id: requestingUser.user_id,
    article_content,
    only_me,
  });
  if (!createResult) {
    throw new Error(message.CREATE_FAIL);
  }
  return createResult[0];
};

// Update
const updateArticle = async (
  articleInfo: IUpdateArticleInput,
  requestingUser: IRequestingUser,
) => {
  let { article_nme, article_id, article_contennt } = articleInfo;
  article_nme = article_nme.replace(specialRegex, '');
  if (
    article_nme.length === 0 ||
    !article_id ||
    !validator.isUUID(article_id, '4')
  ) {
    throw new Error(message.INVALID_INPUT);
  }

  const foundArticle = await ArticleModel.getArticleById(article_id);
  if (!foundArticle) {
    throw new Error(message.NOT_FOUND_ARTICLE);
  }

  if (foundArticle.created_user_id !== requestingUser.user_id) {
    throw new Error(message.NO_PERMISSION);
  }

  const updateResult = await ArticleModel.updateArticle({
    article_nme,
    article_id,
    article_contennt,
  });

  if (!updateResult) {
    throw new Error(message.UPDATE_FAIL);
  }
  return updateResult[0];
};

// Delete
const deleteArticle = async (
  articleId: string,
  requestingUser: IRequestingUser,
) => {
  const foundArticle = await ArticleModel.getArticleById(articleId);
  if (!foundArticle) {
    throw new Error(message.NOT_FOUND_ARTICLE);
  }
  if (foundArticle.created_user_id !== requestingUser.user_id) {
    throw new Error(message.NO_PERMISSION);
  }
  const deleteChapter = await ArticleModel.deleteArticle(articleId);
  if (!deleteChapter) {
    throw new Error(message.DELETE_FAIL);
  }
  return deleteChapter;
};

export const ArticleService: any = {
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
};
