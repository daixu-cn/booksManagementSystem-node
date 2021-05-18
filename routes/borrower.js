const router = require("koa-router")();
const query = require("../module/query");
const multer = require('koa-multer');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

router.post("/session", function (ctx) {
    ctx.body = {
        session: ctx.session
    }
});
//学生登录
router.get("/s_login", async (ctx) => {
    await ctx.render("../views/borrower/s_login");
});
router.post("/s_login", async (ctx) => {
    let obj = ctx.request.body.params; //接收表单传来的数据
    if (!obj.stu_id) { //如果输入的用户名为空
        ctx.body = {
            code: 401,
            msg: "学号为空"
        };
        return;
    };
    if (!obj.stu_ma) {
        ctx.body = {
            code: 402,
            msg: "密码为空"
        };
        return;
    };
    let sql = `SELECT * from students WHERE stu_id=? AND stu_ma=?`;
    let values = [obj.stu_id, obj.stu_ma];
    await query(sql, values).then((results) => {
        ctx.session.stu_id = obj.stu_id;
        if (results.length > 0) {
            ctx.body = {
                code: 200,
                session: ctx.session,
                msg: "学生登录成功",
                data: results[0]
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "学生登录失败",
            };
        }
    }, (err) => {
        ctx.body = {
            code: 201,
            msg: "服务器错误",
            reason: err
        };
    });

})
//根据学号查询信息
router.post("/s_queryInfo", async (ctx) => {
    let obj = ctx.request.body.params; //接收表单传来的数据
    if (!obj.stu_id) { //如果输入的用户名为空
        ctx.body = {
            code: 401,
            msg: "stu_id required"
        };
        return;
    };
    let sql = `SELECT * from students WHERE stu_id=?`;
    let values = [obj.stu_id];
    await query(sql, values).then((results) => {
        let filePath = path.resolve(__dirname, '../public/uploads/' + results[0].stu_img); //图片地址
        let file = null;
        try {
            file = fs.readFileSync(filePath); //读取文件
            let mimeType = mime.lookup(filePath); //读取图片文件类型
            ctx.set('content-type', mimeType); //设置返回类型
            var base64Str = Buffer.from(file, 'utf-8').toString('base64')
            file = 'data:image/png;base64,' + base64Str
            results[0].stu_img = file
        } catch (error) {
            //如果服务器不存在请求的图片，返回默认图片
            results[0].stu_img = "https://s1.ax1x.com/2020/05/09/Ylb3ND.jpg"
        }
        if (results.length > 0) {
            ctx.body = {
                code: 200,
                msg: "Students login successful",
                session: ctx.session,
                data: results[0]
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "Students login error",
            };
        }
    }, (err) => {
        ctx.body = {
            code: 201,
            msg: "Students login error",
            reason: err
        };
    });

})
//检测学号
router.get("/s_checkzh", async (ctx) => {
    let obj = ctx.query;
    if (obj.stu_id == '') {
        ctx.body = {
            code: 401,
            msg: "学号为空！！！"
        }
        return
    }
    var reg = new RegExp('[0-9]{10}');
    if (!reg.test(obj.stu_id)) {
        ctx.body = {
            code: 402,
            msg: "学号必须为十位数字"
        }
        return
    }
    let sql = `select * from students where stu_id=?`;
    let values = [obj.stu_id];
    await query(sql, values).then((results) => {
        if (results.length > 0) {
            ctx.body = {
                code: 201,
                msg: "账号存在，请更换",
            };
        } else {
            ctx.body = {
                code: 200,
                msg: "账号不存在，可以使用",
            };
        }
    }, (err) => {
        ctx.body = {
            code: 301,
            msg: "服务器出错",
            reason: err
        };
    });
})
//查询学生未还的图书
router.get("/noReturnBook", async (ctx) => {
    let obj = ctx.query;
    let sql = `SELECT book.book_id as id,book.book_name AS name,book.book_author AS author,book_sort.sort_name AS sort,book.book_pub AS publishingHouse, borrow.borrow_date AS outDate,borrow.expect_return_date AS returnDate from book LEFT JOIN book_sort ON book.book_sort_id=book_sort.sort_id LEFT JOIN borrow ON borrow.book_id=book.book_id WHERE borrow.student_id=? and book.is_on=0 order by borrow.borrow_date DESC`;
    let values = [obj.stu_id]
    await query(sql, values).then((results) => {
        results.map(item => {
            item.outDate = moment(item.outDate).format('YYYY-MM-DD');
            item.returnDate = moment(item.returnDate).format('YYYY-MM-DD');
            return item;
        })
        if (results.length > 0) {
            ctx.body = {
                code: 200,
                msg: "未还图书查找成功",
                data: results,
                total: results.length
            };
        } else {
            ctx.body = {
                code: 200,
                data: [],
                msg: "未还图书为零",
            };
        }
    }, (err) => {
        ctx.body = {
            code: 201,
            msg: "服务器出错",
            reason: err
        };
    });

})
//查询学生已还的全部图书
router.get("/returnBook", async (ctx) => {
    let obj = ctx.query;
    let sql = `SELECT book.book_id as id,book.book_name AS name,book.book_author AS author,book_sort.sort_name AS sort,book.book_pub AS publishingHouse,return_table.return_date AS returnDate from book LEFT JOIN book_sort ON book.book_sort_id=book_sort.sort_id LEFT JOIN return_table ON book.book_id=return_table.book_id WHERE return_table.student_id=? order by return_table.return_date DESC`;
    let values = [obj.stu_id]
    await query(sql, values).then((results) => {
        results.map(item => {
            item.returnDate = moment(item.returnDate).format('YYYY-MM-DD');
            return item;
        })
        if (results.length > 0) {
            ctx.body = {
                code: 200,
                msg: "已还图书查询成功",
                data: results,
                total: results.length
            };
        } else {
            ctx.body = {
                code: 200,
                data: [],
                msg: "已还图书为零",
            };
        }
    }, (err) => {
        ctx.body = {
            code: 201,
            msg: "服务器出错",
            reason: err
        };
    });

})
//查询学生逾期的图书
router.get("/punish", async (ctx) => {
    let obj = ctx.query;
    let sql = `SELECT book.book_id as id,book.book_name AS name,book.book_author AS author,book_sort.sort_name AS sort,book.book_pub AS publishingHouse,borrow.expect_return_date AS returnDate,book_price AS price from book LEFT JOIN book_sort ON book.book_sort_id=book_sort.sort_id LEFT JOIN borrow ON book.book_id=borrow.book_id WHERE book.is_on = 0 and borrow.student_id=?`;
    let values = [obj.stu_id]
    await query(sql, values).then((results) => {
        let newResults = results.filter(item => {
            item.returnDate = moment(item.returnDate).format('YYYY-MM-DD');
            let date1 = new Date(item.returnDate)
            let date2 = new Date()
            let s1 = date1.getTime()
            let s2 = date2.getTime();
            let total = (s2 - s1) / 1000;
            let overtime = parseInt(total / (24 * 60 * 60))
            if (overtime > 0) {
                //罚款金额，按超出一天0.5元计算
                item.penalty = "¥" + 0.5 * overtime
                if (0.5 * overtime > item.price) {
                    item.penalty = "¥" + item.price
                }
                //未还超出的天数
                item.overtime = overtime;
                return item
            }
        })
        if (newResults.length > 0) {
            ctx.body = {
                code: 200,
                msg: "逾期图书查询成功",
                data: newResults,
                total: newResults.length
            };
        } else {
            ctx.body = {
                code: 200,
                data: [],
                msg: "逾期图书为零",
            };
        }
    }, (err) => {
        ctx.body = {
            code: 201,
            msg: "服务器出错",
            reason: err
        };
    });

})
//查询学生续借状况
router.get("/renewStatus", async (ctx) => {
    let obj = ctx.query;
    let sql = `SELECT book.book_id as id,book.book_name AS name,book.book_author AS author,book_sort.sort_name AS sort,book.book_pub AS publishingHouse, borrow.borrow_date AS outDate,borrow.expect_return_date AS returnDate,borrow.ApplicationStatus AS ApplicationStatus from  book LEFT JOIN book_sort ON book.book_sort_id=book_sort.sort_id LEFT JOIN borrow ON borrow.book_id=book.book_id WHERE borrow.student_id=? and book.is_on = 0 order by borrow.borrow_date DESC`;
    let values = [obj.stu_id]
    await query(sql, values).then((results) => {
        results.map(item => {
            item.outDate = moment(item.outDate).format('YYYY-MM-DD');
            item.returnDate = moment(item.returnDate).format('YYYY-MM-DD');
            return item;
        })
        if (results.length > 0) {
            ctx.body = {
                code: 200,
                msg: "续借状况查询成功",
                data: results,
                total: results.length
            };
        } else {
            ctx.body = {
                code: 200,
                data: [],
                msg: "续借状况查询失败",
            };
        }
    }, (err) => {
        ctx.body = {
            code: 201,
            msg: "服务器出错",
            reason: err
        };
    });

})
//检测学号和姓名
router.post("/StudentForgetPwd", async (ctx) => {
    let obj = ctx.request.body.params;
    if (obj.stu_id == '') {
        ctx.body = {
            code: 401,
            msg: "学号为空！！！"
        }
        return
    }
    if (obj.stu_name == '') {
        ctx.body = {
            code: 402,
            msg: "姓名为空！！！"
        }
        return
    }
    let sql = `select * from students where stu_id=? and stu_name=?`;
    let values = [obj.stu_id, obj.stu_name];
    await query(sql, values).then((results) => {
        if (results.length > 0) {
            ctx.body = {
                code: 200,
                msg: "学号，姓名验证通过",
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "学号，姓名有误",
            };
        }
    }, (err) => {
        ctx.body = {
            code: 301,
            msg: "服务器出错",
            reason: err
        };
    });
})
//学生表增加
router.get("/s_add", async (ctx) => {
    await ctx.render("../views/borrower/s_add");
})
router.post("/s_add", async (ctx) => {
    let obj = ctx.request.body.params; //接收表单传来的数据
    if (!obj.stu_id) { //如果输入的学号为空
        ctx.body = {
            code: 401,
            msg: "学号为空"
        };
        return;
    };
    let sql = `insert into students (stu_id,stu_ma,stu_name,stu_pro,stu_sex) values (?,?,?,?,?)`;
    let values = [obj.stu_id, obj.stu_ma, obj.stu_name, obj.stu_pro, obj.stu_sex];
    await query(sql, values).then((results) => {
        if (results.affectedRows > 0) {
            ctx.body = {
                code: 200,
                msg: "学生添加成功",
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "学生添加失败"
            };
        }
    }, (err) => {
        ctx.body = {
            code: 301,
            msg: "服务器错误",
            reason: err
        };
    });

})

//学生表删除
router.get("/s_delete", async (ctx) => {
    await ctx.render("../views/borrower/s_delete");
})
router.post("/s_delete", async (ctx) => {
    let obj = ctx.request.body.params; //接收表单传来的数据
    let sql = `delete from students where stu_id=? and stu_name=?`;
    let values = [obj.id,obj.name];
    await query(sql, values).then((results) => {
        if (results.affectedRows > 0) {
            ctx.body = {
                code: 200,
                msg: "删除成功",
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "删除失败"
            };
        }
    }, (err) => {
        ctx.body = {
            code: 301,
            msg: "服务器错误",
            reason: err
        };
    });

})

//学生信息修改
router.get("/s_update", async (ctx) => {
    await ctx.render("../views/borrower/s_update");
})
router.post("/s_update", async (ctx) => {
    let obj = ctx.request.body.params; //接收表单传来的数据
    let sql = `update students set stu_sex=?,stu_age=?,stu_pro=?,stu_grade=?,stu_name=? WHERE stu_id=?`;
    let values = [obj.stu_sex, obj.stu_age, obj.stu_pro, obj.stu_grade, obj.stu_name, obj.stu_id];
    await query(sql, values).then((results) => {
        if (results.affectedRows > 0) {
            ctx.body = {
                code: 200,
                msg: "学生信息修改成功",
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "学生信息修改失败",
            };
        }
    }, (err) => {
        ctx.body = {
            code: 301,
            msg: "服务器出错",
            reason: err
        };
    });
})
//学生密码修改
router.post("/StudentUpdatePwd", async (ctx) => {
    let obj = ctx.request.body.params;
    let sql = `update students set stu_ma=? WHERE stu_id=? and stu_name=?`;
    let values = [obj.stu_ma, obj.stu_id, obj.stu_name];
    await query(sql, values).then((results) => {
        if (results.affectedRows > 0) {
            ctx.body = {
                code: 200,
                msg: "Student password changed successfully",
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "Student password changed error",
            };
        }
    }, (err) => {
        ctx.body = {
            code: 201,
            msg: "Student password changed error",
            reason: err
        };
    });
})
//学生续借状态修改
router.post("/modifyRenewalStatus", async (ctx) => {
    let obj = ctx.request.body.params;
    let sql = `update borrow set ApplicationStatus=? WHERE book_id=?`;
    let values = [obj.ApplicationStatus, obj.bookId];
    await query(sql, values).then((results) => {
        if (results.affectedRows > 0) {
            ctx.body = {
                code: 200,
                msg: "续借状态修改成功",
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "续借状态修改失败",
            };
        }
    }, (err) => {
        ctx.body = {
            code: 201,
            msg: "服务器出错",
            reason: err
        };
    });
})

//学生头像上传
router.post("/upload", async (ctx) => {
    let filename = ctx.request.files.file.path.slice(ctx.request.files.file.path.indexOf("upload_"));
    let obj = ctx.request.body; //接收表单传来的数据
    //查询修改前的图片是哪一张
    await query("SELECT * FROM students WHERE stu_id=?", [obj.stu_id]).then(results => {
        let filePath = path.resolve(__dirname, '../public/uploads/' + results[0].stu_img)
        // 删除更改前的图片
        fs.unlink(filePath, err => {
            if (err) {
                return
            }
        });
    })
    let sql = `update students set stu_img=? where stu_id=?`;
    let values = [filename, obj.stu_id];
    //修改收到的图片存到数据库
    await query(sql, values).then((results) => {
        let filePath = path.resolve(__dirname, '../public/uploads/' + filename); //图片地址
        let file = null;
        try {
            file = fs.readFileSync(filePath); //读取文件
        } catch (error) {
            //如果服务器不存在请求的图片，返回默认图片
            ctx.body = "https://s1.ax1x.com/2020/05/09/Ylb3ND.jpg"
        }
        let mimeType = mime.lookup(filePath); //读取图片文件类型
        ctx.set('content-type', mimeType); //设置返回类型
        var base64Str = Buffer.from(file, 'utf-8').toString('base64')
        file = 'data:image/png;base64,' + base64Str
        ctx.body = file; //返回图片
    }, (err) => {
        ctx.body = {
            code: 301,
            msg: "服务器出错",
            reason: err
        };
    });

    // let filePath = path.resolve(__dirname, '../public/uploads/upload_0877088f0468e93692ad871ca87423dc.jpg'); //图片地址
    // let file = null;
    // try {
    //     file = fs.readFileSync(filePath); //读取文件
    // } catch (error) {
    //     //如果服务器不存在请求的图片，返回默认图片
    //     filePath = path.join(__dirname, '/images/default.png'); //默认图片地址
    //     file = fs.readFileSync(filePath); //读取文件	    
    // }

    // let mimeType = mime.lookup(filePath); //读取图片文件类型
    // ctx.set('content-type', mimeType); //设置返回类型
    // var base64Str = Buffer.from(file, 'utf-8').toString('base64')
    // file = 'data:image/png;base64,' + base64Str
    // ctx.body = file; //返回图片
})
//获取当前学生信息
router.get("/StudentInfo", async (ctx) => {
    let obj = ctx.request.query; //接收表单传来的数据
    let sql = `select * from students where stu_id=?`;
    let values = [obj.studentId];
    await query(sql, values).then((results) => {
        ctx.body = {
            code: 200,
            msg: "查询成功",
            data: results[0]
        };
    }, (err) => {
        ctx.body = {
            code: 201,
            msg: "查询失败",
            reason: err
        };
    });
})
module.exports = router;