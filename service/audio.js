const Audio = require('../models/audio');
const fs = require('fs');
const path = require('path');

const audioAddService = async (userInfo, data) => {
    if (userInfo.role === 2) {
        return '仅管理员可创建有声书,暂无权限操作';
    } else {
        const params = {
            audioName: data.audioName,
            audioType: data.audioType,
            cover: data.cover,
            createUser: userInfo.userName,
            audioAbstract: data.audioAbstract
        };
        let result = await audioAdd(params);
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
    }
};

const audioGetAllService = async (data) => {
    const {currentPage, currentSize} = data;
    let result = await audioGetAll(currentPage, currentSize);
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

const audioGetAllByTypeService = async (data) => {
    const {currentPage, currentSize, audioType} = data;
    let result = await audioGetAllByType(currentPage, currentSize, audioType);
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

const audioGetAllByUserNameService = async (data) => {
    const {currentPage, currentSize, userName} = data;
    let result = await audioGetAllByUserName(currentPage, currentSize, userName);
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

const audioDeleteService = async (userInfo, id) => {
    let result = null;
    if (userInfo.role !== 0) {
        result = '暂无权限操作';
    } else {
        let result = await audioDelete(id);
        if (result.code === 0) {
            return result.data;
        } else {
            return result.message.toString();
        }
    }
};

const audioChangeService = async (userInfo, data) => {
    let result = null;
    if (userInfo.role !== 0) {
        result = '暂无权限操作';
    } else {
        let result = await audioChange(data);
        if (result.code === 0) {
            return result.data;
        } else {
            return result.message.toString();
        }
    }
};

const audioGetOneService = async (id) => {
    let result = await audioGetOne(id);
    if (result.code === 0) {
        return result.data;
    } else {
        return result.message.toString();
    }
};

// 数据库操作
const audioGetOne = async (id) => {
    let result = null;
    try {
        const audio = await Audio.findOne({
            where: {
                id: id
            }
        });
        if (audio === null) {
            result = {
                code: -1,
                message: '记录不存在'
            };
        } else {
            result = {
                code: 0,
                data: audio
            }
        }
    } catch (err) {
        result = {
            code: -1,
            message: err
        };
    }
    return result;
};
const audioAdd = async (data) => {
    let result = null;
    try {
        let audio = await Audio.create({
            audioName: data.audioName,
            audioType: data.audioType,
            coverPath: 'default',
            createUser: data.createUser,
            audioAbstract: data.audioAbstract
        });
        // 创建可读流
        const reader = fs.createReadStream(data.cover.path);
        let filePath = path.join(__dirname, '../public/image/') + `${audio.id}.${data.cover.type.split('/')[1]}`;
        // 创建可写流
        const upStream = fs.createWriteStream(filePath);
        // 可读流通过管道写入可写流
        reader.pipe(upStream);
        // 更改数据库内容
        audio.coverPath = /image/ + audio.id + '.' + data.cover.type.split('/')[1];
        await audio.save();
        result = {
            code: 0,
            data: audio
        };
    } catch (err) {
        result = {
            code: -1,
            data: err
        };
    }
    return result;
};

const audioChange = async (data) => {
    let result = null;
    try {
        let audio = await Audio.findOne({
            where: {
                id: data.id
            }
        });
        if (audio === null) {
            result = {
                code: -1,
                message: '记录不存在'
            };
        } else {
            audio.audioName = data.audioName;
            audio.audioType = data.audioType;
            audio.audioAbstract = data.audioAbstract;
            await audio.save();
            result = {
                code: 0,
                data: audio
            };
        }
    } catch (err) {
        result = {
            code: -1,
            data: err
        };
    }
    return result;

};

const audioGetAll = async (currentPage, currentSize) => {
    let result = null;
    try {
        let audios = await Audio.findAndCountAll({
            offset: (currentPage - 1) * currentSize,
            limit: currentSize
        });
        result = {
            code: 0,
            data: audios
        };
    } catch (err) {
        result = {
            code: -1,
            data: err
        }
    }
    return result;
};

const audioGetAllByType = async (currentPage, currentSize, audioType) => {
    let result = null;
    try {
        let audios = await Audio.findAndCountAll({
            offset: (currentPage - 1) * currentSize,
            limit: currentSize,
            where: {
                audioType: audioType
            }
        });
        result = {
            code: 0,
            data: audios
        };
    } catch (err) {
        result = {
            code: -1,
            data: err
        }
    }
    return result;
};

const audioGetAllByUserName = async (currentPage, currentSize, userName) => {
    let result = null;
    try {
        let audios = await Audio.findAndCountAll({
            offset: (currentPage - 1) * currentSize,
            limit: currentSize,
            where: {
                createUser: userName
            }
        });
        result = {
            code: 0,
            data: audios
        };
    } catch (err) {
        result = {
            code: -1,
            data: err
        }
    }
    return result;
};

const audioDelete = async (id) => {
    let result = null;
    try {
        let audio = await Audio.findOne({
            where: {
                id: id
            }
        });
        if (audio === null) {
            result = {
                code: -1,
                message: '该记录不存在'
            };
        } else {
            await audio.destroy();
            result = {
                code: 0,
                data: audio
            };
        }
    } catch (err) {
        result = {
            code: -1,
            message: err
        }
    }
    return result
};

module.exports = {
    audioAddService,
    audioGetAllService,
    audioDeleteService,
    audioChangeService,
    audioGetOneService,
    audioGetAllByTypeService,
    audioGetAllByUserNameService
};