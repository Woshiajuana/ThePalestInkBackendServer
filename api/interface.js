/**
 * Created by Administrator on 2017/4/24.
 * 接口工具库
 */
/**引入分页查询工具库*/
const dbHelper = require('./page-query');
/**引入token工具*/
const jwt = require('jsonwebtoken');
/**引入数据模型*/
const user_module = require('../models/user');
const balance_module = require('../models/balance');
/**引入express包*/
const express = require('express');
/**创建路由*/
const router = express.Router();
/**验证token的中间键*/
const check_api_token = require('./check_api_token');
/**发送邮件的插件*/
const sendMail = require('../lib/mail');


/**创建接口*/
/**用户登录*/
router.post('/thepalestink/login',(req,res) => {
    /**这里的req.body能够使用就在index.js中引入了const bodyParser = require('body-parser')*/
    if(!req.query.user_name) {
        res.json({status: 0, msg: '请输入帐号'});
        return;
    }
    if(!req.query.user_password) {
        res.json({status: 0, msg: '请输入密码'});
        return;
    }
    let user = {
        user_name: req.query.user_name,
        user_password: req.query.user_password
    };
    user_module.find(user, function(err, doc){
        if(doc.length){
            /**创建token*/
            let token = jwt.sign(user, 'app.get(superSecret)', {
                expiresIn: 60*60*24 /**设置过期时间*/
            });
            res.json({
                status: 1,
                msg: '登陆成功',
                data: {
                    token,
                    user: {
                        _id: doc[0]._id,
                        user_name: doc[0].user_name
                    }
                }
            });
        }else{
            res.json({
                status: 0,
                msg: '帐号或密码不正确'
            });
        }
    });
});
/**验证用户信息是否已注册*/
router.get('/thepalestink/checkUserRepeat',(req,res) => {
    let user = JSON.parse(req.query.user_msg);
    user_module.count(user, function(err, doc){
        if(doc){
            res.json({ status: 0 });
        }else{
            res.json({ status: 1 });
        }
    });
});
/**发送邮件*/
var code_value = NaN;
router.get('/thepalestink/sendEmail',(req,res) => {
    let user_email = req.query.user_email;
    if(!req.query.user_email) {
        res.json({status: 0, msg: '请输入邮箱'});
        return;
    }
    if(!(/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/).test(req.query.user_email)) {
        res.json({status: 0, msg: '邮箱格式不正确'});
        return;
    }
    var random_num = '';
    for(var i=0; i<6; i++) {
        random_num += Math.floor(Math.random()*10);
    }
    sendMail(user_email,'浪笔头注册验证', '您的验证码是：' + code_value,function () {
        code_value = random_num;
        setTimeout(function () {
            code_value = NaN;
        },60*2*1000);
        res.json({ status: 1 });
    },function () {
        res.json({ status: 0 });
    });
});
/**用户注册*/
router.post('/thepalestink/register',(req,res) => {
    if(!req.query.user_name) {
        res.json({status: 0, msg: '请输入帐号'});
        return;
    }
    if(!req.query.user_password) {
        res.json({status: 0, msg: '请输入密码'});
        return;
    }
    if(!req.query.user_email) {
        res.json({status: 0, msg: '请输入邮箱'});
        return;
    }
    if(!(/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/).test(req.query.user_email)) {
        res.json({status: 0, msg: '邮箱格式不正确'});
        return;
    }
    if( req.query.user_password.length != 6) {
        res.json({status: 0, msg: '请输入6位数的密码'});
        return;
    }
    if(req.query.user_password != req.query.user_too_password) {
        res.json({status: 0, msg: '两次密码不一致'});
        return;
    }
    if( code_value != req.query.user_code) {
        res.json({status: 0, msg: '验证码错误'});
        return;
    }
    let user = {
        user_name: req.query.user_name,
        user_email: req.query.user_email,
        user_password: req.query.user_password,
        user_register_date: new Date()
    };
    user_module.create(user, function(err, doc){
        if(err){
            res.json({status: 0, msg: '注册失败'});
        }else {
            res.json({status: 1, msg: '注册成功'});
        }
    });
});


/**查询用户总金额*/
router.get('/thepalestink/fetchTotalBalance',check_api_token,(req,res) => {
    let user = {
        user_name: req.query.user_name
    };

    users.count(user, function(err, doc){
        if(doc){
            res.json({
                status: 0,
                msg: '帐号已存在'
            });
        }else{
            res.json({
                status: 1,
                msg: '帐号可以注册'
            });
        }
    });
});




//
// /**获取文章数据*/
// router.get('/ajuan/fetchArticle',(req,res) => {
//     let article_type = req.query.tab == 'all' ? '' : req.query.tab;
//     let page = +req.query.page_num || 1;
//     let rows = +req.query.page_size || 12;
//     let key_word = req.query.key_word;
//     let query = {};
//     if(article_type) query.article_type = article_type;
//     if(key_word) query.article_title =  eval("/"+key_word+"/ig");
//     dbHelper.pageQuery(page, rows, articles, '', query, {}, (error, $page) => {
//         if(error){
//             res.json({status: 0, msg: '获取信息失败'});
//         }else{
//             res.json({
//                 status:1,
//                 data: $page.results,
//                 article_total: $page.total,
//                 page_count: Math.ceil($page.pageCount)
//             });
//         }
//     });
// });
//
// /**根据文章_id获取文章数据*/
// router.get('/ajuan/fetchDetail',(req,res) => {
//     let _id = req.query.article_id;
//     articles.find({
//         _id: _id
//     },(err,doc) => {
//         if(err){
//             res.json({status:0,msg:'获取信息失败'})
//         }else{
//             res.json({status:1,data:doc,msg:'获取信息成功'});
//         }
//     });
// });
//
// /**后台获取文章数据*/
// router.get('/ajuan_backstage/fetchArticle',check_api_token,(req,res) => {
//     let article_type = req.query.tab == 'all' ? '' : req.query.tab;
//     let page = +req.query.page_num || 1;
//     let rows = +req.query.page_size || 12;
//     let key_word = req.query.key_word;
//     let query = {};
//     if(article_type) query.article_type = article_type;
//     if(key_word) query.article_title =  eval("/"+key_word+"/ig");
//     dbHelper.pageQuery(page, rows, articles, '', query, {}, (error, $page) => {
//         if(error){
//             res.json({status: 0, msg: '获取信息失败'});
//         }else{
//             res.json({
//                 status:1,
//                 data: $page.results,
//                 article_total: $page.total,
//                 page_count: Math.ceil($page.pageCount)
//             });
//         }
//     });
// });
//
// /**创建文章*/
// router.get('/ajuan_backstage/insertArticle',check_api_token,(req,res) => {
//     if(!req.query.article){
//         res.json({status: 0, msg: '请把信息填写完整'});
//         return;
//     }
//     let article = JSON.parse(req.query.article);
//     articles.create(article,(err, doc) => {
//         if(err){
//             res.json({status: 0, msg: '提交文章失败'});
//         }else {
//             res.json({status: 1, msg: '提交文章成功'});
//         }
//     });
// });
//
// /**删除文章*/
// router.get('/ajuan_backstage/removeArticle',check_api_token,(req,res) => {
//     let article_id = req.query.article_id;
//     articles.remove({_id:article_id},(err, doc) => {
//         if(err){
//             res.json({status: 0, msg: '删除文章失败'});
//         }else {
//             res.json({status: 1, msg: '删除文章成功'});
//         }
//     })
// });

module.exports = router;