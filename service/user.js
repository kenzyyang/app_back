/**
 *  @author:  kenzyyang
 *  @date:  2019-4-8
 *  @desc:  user表的 service层，用于处理复杂的业务逻辑，减轻controller层的代码量
 * */
const User = require('../models/user');
const {
    USER,
    ADMIN_USER,
    SUPER_ADMIN_USER
} = require('../config/rbac');

// 注册
const userRegisterService = async (data) => {
    const result = await userAdd(data);
    if (result.code === 0) {
        return result.data;
    } else {
        // 如果报错，将异常信息拼接之后返回到前端
        let error = '';
        for (let i in result.data['errors']) {
            error += result.data['errors'][i].message;
        }
        return error;
    }
};

// 登录
const userLoginService = async (data) => {
    const result = await userQueryByName(data.userName);
    if (result.code === 0) {
        if (result.data === null) {
            return '用户名不存在';
        } else if (data.password !== result.data.password) {
            return '密码错误';
        } else {
            return result.data;
        }
        return result.data;
    } else {
        // 如果报错，将异常信息拼接之后返回到前端
        let error = '';
        for (let i in result.data['errors']) {
            error += result.data['errors'][i].message;
        }
        return error;
    }
};

// 用户基本信息修改
const userChangeInfoService = async (data, userInfo) => {
    let result, user;
    // 检查需要修改的用户信息是否存在
    let obj = await userQueryById(data.id);
    console.log(data);
    console.log(userInfo);
    console.log(obj);
    if (obj.code === -1) {
        return obj.data;
    }
    else{
        user = obj.data;
    }
    console.log(data);
    console.log(userInfo);
    // 修改自身信息,无限制
    if (userInfo.id === data.id) {
        result = await userChange(data);
    }
    // 当修改他人id 时
    else if (userInfo.id !== data.id) {
        // 超级管理员，无限制，直接修改
        if (userInfo.role === SUPER_ADMIN_USER) {
            result = await userChange(data);
        }
        // 管理员只能修改普通用户的信息，需要查库
        else if (userInfo.role === ADMIN_USER) {
            if(user.role !== USER){
                return '暂无权限操作';
            }
            else{
                result = await userChange(data);
            }
        }
        else{
            return '暂无权限操作';
        }
    }
    if(result.code === 0){
        return result.data;
    }
    else{
        // 如果报错，将异常信息拼接之后返回到前端
        let error = '';
        for (let i in result.data['errors']) {
            error += result.data['errors'][i].message;
        }
        return error;
    }
};

/**
 *  @author:  kenzyyang
 *  @date:  2019-4-8
 *  @desc:  数据库原操作，增删改查
 * */
const userAdd = async (data) => {
    let result = null;
    try {
        const user = await User.create({
            userName: data.userName,
            nickName: data.nickName,
            password: data.password,
            email: data.email
        });
        result = {
            code: 0,
            data: user
        };
    } catch (err) {
        result = {
            code: -1,
            data: err
        };
    }
    return result;
};

const userQueryByName = async (userName) => {
    let result = null;
    try {
        const user = await User.findOne({
            where: {
                userName: userName
            }
        });
        result = {
            code: 0,
            data: user
        };
    } catch (err) {
        result = {
            code: -1,
            data: err
        };
    }
    return result;
};

const userQueryById = async (id) => {
    let result = null;
    try {
        const user = await User.findOne({
            where: {
                id: id
            }
        });
        result = {
            code: 0,
            data: user
        };
    } catch (err) {
        result = {
            code: -1,
            data: err
        };
    }
    return result;
};

// 修改用户基本信息
const userChange = async (data) => {
    let result = null;
    try {
        const user = await User.findOne({
            where: {
                id: data.id
            }
        });
        user.password = data.password;
        user.email = data.email;
        user.nickName = data.nickName;
        await user.save();
        result = {
            code: 0,
            data: user
        };
    } catch (err) {
        result = {
            code: -1,
            data: err
        };
    }
    return result;
};


module.exports = {
    userRegisterService,
    userLoginService,
    userChangeInfoService
};
