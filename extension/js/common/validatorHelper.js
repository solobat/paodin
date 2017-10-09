const ccReg = /([\u4e00-\u9fa5]+)/g;

export function getTextLen(text) {
    if (!text) {
        return 0;
    }

    let len = text.length;
    let ccLen = (text.match(ccReg) || []).join('').length;

    return len - ccLen + ccLen * 2;
}

export const checkText = (maxLength, fieldName, required = true) => (rule, value, callback) => {
    if (required && value === '') {
        callback(new Error(`请填写${fieldName}`));
    } else if (getTextLen(value) > maxLength) {
        callback(new Error(`${fieldName}长度超出!`));
    } else {
        callback();
    }
};

export const create = (type = 'string', message, trigger, required = true) => {
    return {
        type: type,
        required: required,
        message: message,
        trigger: trigger
    };
};

export const radio = (name, required = true) => {
    return [create('number', `请选择${name}`, 'change', required)];
};

export const textValidatorByLen = (name, maxLen = 35, required) => {
    return {
        validator: checkText(maxLen, name, required),
        trigger: 'change'
    };
};

export const selector = (name, type = 'number', required = true) => {
    return [create(type, `请选择${name}`, 'change', required)];
};

export const text = (name, maxLen, required = true) => {
    let ret = [
        create('string', `请填写${name}`, 'blur', required)
    ];

    if (maxLen) {
        ret.push(textValidatorByLen(name, maxLen, required));
    }

    return ret;
};

export const array = (name, required = true) => {
    return [
        create('array', `请至少选择一个${name}`, 'change', required)
    ];
};

export const url = (name, required = true) => {
    return [
        create('url', `${name}不是一个有效的链接`, 'blur', required)
    ];
};

const imgReg = /https?:\/\/.+\.(jpg|gif|png)/;

export const imgurl = (name, required = true) => {
    return [
        {
            required: required,
            validator: (rule, value, callback) => {
                if (!value || !value.url || imgReg.test(value.url)) {
                    callback();
                } else {
                    callback(new Error(`${name}图片链接无效`));
                }
            },
            trigger: 'change'
        }
    ];
};

// const pathReg = /([a-zA-Z0-9_\.-]*)?/;

const pathReg = /^[0-9a-zA-Z\-\_\&\*\$\@]*$/;

export const urlpath = (name, required = true) => {
    return [
        {
            required: required,
            validator: (rule, value, callback) => {
                if (value && pathReg.test(value)) {
                    callback();
                } else {
                    callback(new Error(`${name}有特殊字符，请检查`));
                }
            },
            trigger: 'blur'
        }
    ]
}