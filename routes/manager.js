const router = require("koa-router")();
const query = require("../module/query");
const sd = require('silly-datetime');
const moment = require('moment');

router.post("/session", function (ctx) {
    ctx.body = {
        session: ctx.session
    }
});

//管理员注册
// router.get("/m_register", async (ctx) => {
//     await ctx.render("../views/monager/m_register");
// })
// router.post("/m_register", async (ctx) => {
//     let obj = ctx.request.body; //接收表单传来的数据
//     if (!obj.manager_zh) { //如果输入的用户名为空
//         ctx.body = {
//             code: 401,
//             msg: "manager_zh required"
//         };
//         return;
//     };
//     if (!obj.manager_ma) { //如果输入的密码为空
//         ctx.body = {
//             code: 402,
//             msg: "manager_ma required"
//         };
//         return;
//     };
//     let sql = `insert into manager (manager_zh,manager_ma,manager_time) values (?,?,?)`;
//     let values = [obj.manager_zh, obj.manager_ma, sd.format(new Date(), 'YYYY-MM-DD')];
//     await query(sql, values).then((results) => {
//         if (results.affectedRows > 0) {
//             ctx.body = {
//                 code: 200,
//                 msg: "Administrator registration successful",
//                 data: {
//                     manager_zh: obj.manager_zh,
//                     manager_ma: obj.manager_ma
//                 }
//             };
//         } else {
//             ctx.body = {
//                 code: 201,
//                 msg: "Administrator registration error"
//             };
//         }
//     }, (err) => {
//         ctx.body = {
//             code: 201,
//             msg: "Administrator registration error",
//             reason: err
//         };
//     });

// })

//管理员登录
router.get("/m_login", async (ctx) => {
    await ctx.render("../views/monager/m_login");
});
router.post("/m_login", async (ctx) => {
    let obj = ctx.request.body.params; //接收表单传来的数据
    if (!obj.manager_zh) { //如果输入的用户名为空
        ctx.body = {
            code: 401,
            msg: "账号为空"
        };
        return;
    };
    if (!obj.manager_ma) {
        ctx.body = {
            code: 402,
            msg: "密码为空"
        };
        return;
    };
    let sql = `SELECT * from manager WHERE manager_zh=? AND manager_ma=?`;
    let values = [obj.manager_zh, obj.manager_ma];
    await query(sql, values).then((results) => {
        ctx.session.manager_zh = obj.manager_zh;
        if (results.length > 0) {
            ctx.body = {
                code: 200,
                msg: "管理员登录成功",
                data: results[0]
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "管理员登录失败",
            };
        }
    }, (err) => {
        ctx.body = {
            code: 201,
            msg: "管理员登录失败",
            reason: err
        };
    });

})

//管理员注销
// router.get("/m_logout", async (ctx) => {
//     await ctx.render("../views/monager/m_logout");
// })
// router.post("/m_logout", async (ctx) => {
//     let obj = ctx.request.body; //接收表单传来的数据
//     if (!obj.manager_zh) { //如果输入的用户名为空
//         ctx.body = {
//             code: 401,
//             msg: "manager_zh required"
//         };
//         return;
//     };
//     if (!obj.manager_ma) {
//         ctx.body = {
//             code: 402,
//             msg: "manager_ma required"
//         };
//         return;
//     };
//     let sql = `delete from manager WHERE manager_zh=? AND manager_ma=?`;
//     let values = [obj.manager_zh, obj.manager_ma];
//     await query(sql, values).then((results) => {
//         if (results.affectedRows > 0) {
//             ctx.body = {
//                 code: 200,
//                 msg: "Administrator m_logout successful",
//                 data: results[0]
//             };
//         } else {
//             ctx.body = {
//                 code: 201,
//                 msg: "Administrator m_logout error",
//             };
//         }
//     }, (err) => {
//         ctx.body = {
//             code: 201,
//             msg: "Administrator m_logout error",
//             reason: err
//         };
//     });
// });

//管理员信息修改
router.get("/m_update", async (ctx) => {
    await ctx.render("../views/monager/m_update");
})
router.post("/m_update", async (ctx) => {
    let obj = ctx.request.body; //接收表单传来的数据
    await query("select * from manager where manager_zh=?", obj.manager_zh).then((results) => {
        for (let key in obj) {
            if (obj[key] == "") {
                obj[key] = results[0][key]
            }
        }
    })
    let sql = `update manager set manager_age=?,manager_phone=?,manager_book_id=?,manager_ma=? WHERE manager_zh=?`;
    let values = [obj.manager_age, obj.manager_phone, obj.manager_book_id, obj.manager_ma, obj.manager_zh];
    await query(sql, values).then((results) => {
        if (results.affectedRows > 0) {
            ctx.body = {
                code: 200,
                msg: "Administrator m_update successful",
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "Administrator m_update error",
            };
        }
    }, (err) => {
        ctx.body = {
            code: 201,
            msg: "Administrator m_update error",
            reason: err
        };
    });
})

//检测账号
// router.get("/m_checkzh", async (ctx) => {
//     await ctx.render("../views/monager/m_checkzh");
// })
// router.get("/m_checkzh1", async (ctx) => {
//     let obj = ctx.query;
//     console.log(obj)
//     if (!obj.manager_zh) {
//         ctx.body = {
//             code: 401,
//             msg: "账号为空！！！"
//         }
//     }
//     let sql = `select * from manager where manager_zh=?`;
//     let values = [obj.manager_zh];
//     await query(sql, values).then((results) => {
//         if (results.length > 0) {
//             ctx.body = {
//                 code: 201,
//                 msg: "This account exists, cannot register",
//             };
//         } else {
//             ctx.body = {
//                 code: 200,
//                 msg: "This account does not exist, you can register",
//             };
//         }
//     }, (err) => {
//         ctx.body = {
//             code: 201,
//             msg: "Administrator m_checkzh1 error",
//             reason: err
//         };
//     });
// })
//检测账号和姓名
router.post("/AdminForgetPwd", async (ctx) => {
    let obj = ctx.request.body.params;
    if (obj.stu_id == '') {
        ctx.body = {
            code: 401,
            msg: "账号为空！！！"
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
    let sql = `select * from manager where manager_zh=? and manager_name=?`;
    let values = [obj.manager_zh, obj.manager_name];
    await query(sql, values).then((results) => {
        if (results.length > 0) {
            ctx.body = {
                code: 200,
                msg: "该账号,姓名无误",
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "该账号,姓名不匹配",
            };
        }
    }, (err) => {
        ctx.body = {
            code: 201,
            msg: "该账号,姓名不匹配",
            reason: err
        };
    });
})
//管理员密码修改
router.post("/AdminUpdatePwd", async (ctx) => {
    let obj = ctx.request.body.params;
    let sql = `update manager set manager_ma=? WHERE manager_zh=? and manager_name=?`;
    let values = [obj.manager_ma, obj.manager_zh, obj.manager_name];
    await query(sql, values).then((results) => {
        if (results.affectedRows > 0) {
            ctx.body = {
                code: 200,
                msg: "管理员密码修改成功",
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "管理员密码修改失败",
            };
        }
    }, (err) => {
        ctx.body = {
            code: 201,
            msg: "管理员密码修改失败",
            reason: err
        };
    });
})
//检测手机号
// router.get("/m_checkphone", async (ctx) => {
//     await ctx.render("../views/monager/m_checkphone");
// })
// router.get("/m_checkphone1", async (ctx) => {
//     let obj = ctx.request.query; //接收表单传来的数据
//     if (!obj.manager_phone) {
//         ctx.body = {
//             code: 401,
//             msg: "手机号为空！！！"
//         }
//         return;
//     }
//     let sql = `select * from manager where manager_phone=?`;
//     let values = [obj.manager_phone];
//     await query(sql, values).then((results) => {

//         if (results.length > 0) {
//             ctx.body = {
//                 code: 201,
//                 msg: "This mobile phone number exists and cannot be used",
//             };
//         } else {
//             ctx.body = {
//                 code: 200,
//                 msg: "The phone number does not exist and can be used",
//             };
//         }
//     }, (err) => {
//         ctx.body = {
//             code: 201,
//             msg: "Administrator m_checkzh1 error",
//             reason: err
//         };
//     });
// })

//获取当前管理员信息
// router.get("/m_getinfo", async (ctx) => {
//     await ctx.render("../views/monager/m_getinfo");
// })
router.get("/m_getinfo", async (ctx) => {
    let obj = ctx.request.query; //接收表单传来的数据
    let sql = `select * from manager where manager_zh=?`;
    let values = [obj.manager_zh];
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

//查询学生续借状况
router.get("/AllRenewStatus", async (ctx) => {
    let sql = `SELECT book.book_id as id,book.book_name AS name,book.book_author AS author,book_sort.sort_name AS sort,book.book_pub AS publishingHouse, borrow.borrow_date AS outDate,borrow.expect_return_date AS returnDate from book LEFT JOIN book_sort ON book.book_sort_id=book_sort.sort_id LEFT JOIN borrow ON borrow.book_id=book.book_id WHERE borrow.ApplicationStatus=1 and book.is_on = 0 order by borrow.borrow_date DESC`;
    await query(sql).then((results) => {
        results.map(item => {
            item.outDate = moment(item.outDate).format('YYYY-MM-DD');
            item.returnDate = moment(item.returnDate).format('YYYY-MM-DD');
            return item;
        })
        if (results.length > 0) {
            ctx.body = {
                code: 200,
                msg: "查询成功",
                data: results,
                total: results.length
            };
        } else {
            ctx.body = {
                code: 200,
                data: [],
                msg: "零条数据",
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
//学生续借状态修改
router.post("/addReturnBook", async (ctx) => {
    let obj = ctx.request.body.params;
    let sql = `select * from borrow WHERE book_id=?`;
    let values = [obj.bookId];
    let data = await query(sql, values)

    function DateAdd(interval, number, date) {
        /* 
         *   功能:实现VBScript的DateAdd功能. 
         *   参数:interval,字符bai串表达式du，表示zhi要添加dao的时间间隔. 
         *   参数:number,数值表达式，表示要添加的时间间隔的个数. 
         *   参数:date,时间对象. 
         *   返回:新的时间对象. 
         *   var   now   =   new   Date(); 
         *   var   newDate   =   DateAdd( "d ",5,now); 
         *---------------   DateAdd(interval,number,date)   ----------------- 
         */
        switch (interval) {
            case "y ": {
                date.setFullYear(date.getFullYear() + number);
                return date;
                break;
            }
            case "q ": {
                date.setMonth(date.getMonth() + number * 3);
                return date;
                break;
            }
            case "m ": {
                date.setMonth(date.getMonth() + number);
                return date;
                break;
            }
            case "w ": {
                date.setDate(date.getDate() + number * 7);
                return date;
                break;
            }
            case "d ": {
                date.setDate(date.getDate() + number);
                return date;
                break;
            }
            case "h ": {
                date.setHours(date.getHours() + number);
                return date;
                break;
            }
            case "m ": {
                date.setMinutes(date.getMinutes() + number);
                return date;
                break;
            }
            case "s ": {
                date.setSeconds(date.getSeconds() + number);
                return date;
                break;
            }
            default: {
                date.setDate(d.getDate() + number);
                return date;
                break;
            }
        }
    }
    if (obj.ApplicationStatus === 3) {
        //加一个月.  
        newDate = await DateAdd("m ", 1, data[0].expect_return_date);
        let returnDate = await moment(newDate).format('YYYY-MM-DD')
        let sql = `update borrow set ApplicationStatus=?,expect_return_date=? WHERE book_id=?`;
        let values = [obj.ApplicationStatus, returnDate, obj.bookId];
        await query(sql, values).then((results) => {
            if (results.affectedRows > 0) {
                ctx.body = {
                    code: 200,
                    msg: "续借状态修改成功"
                };
            } else {
                ctx.body = {
                    code: 201,
                    msg: "续借状态修改失败"
                };
            }
        }, (err) => {
            ctx.body = {
                code: 201,
                msg: "服务器出错",
                reason: err
            };
        });
    } else {
        let sql = `update borrow set ApplicationStatus=? WHERE book_id=?`;
        let values = [obj.ApplicationStatus, obj.bookId];
        await query(sql, values).then((results) => {
            if (results.affectedRows > 0) {
                ctx.body = {
                    code: 200,
                    msg: "Student ApplicationStatus changed successfully",
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
    }
})
//查询所有学生及借书情况
router.get("/allStuden", async (ctx) => {
    let sql = `SELECT students.stu_id AS id,students.stu_name as name,students.stu_age as age,students.stu_sex as sex,students.stu_pro as domain,students.stu_grade as grade,(SELECT COUNT(*) FROM borrow WHERE borrow.student_id=students.stu_id) as borrowedBook,(SELECT COUNT(*) FROM return_table WHERE return_table.student_id=students.stu_id) as notReturnBook from students`;
    await query(sql).then((results) => {
        if (results.length > 0) {
            ctx.body = {
                code: 200,
                msg: "全部学生查询成功",
                data: results,
                total: results.length
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "全部学生查询失败",
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
//查询所有学生及借书情况分页
router.get("/allStudenPaging", async (ctx) => {
    let obj = ctx.request.query;
    console.log(obj)
    let sql = `SELECT students.stu_id AS id,students.stu_name as name,students.stu_age as age,students.stu_sex as sex,students.stu_pro as domain,students.stu_grade as grade,(SELECT COUNT(*) FROM borrow WHERE borrow.student_id=students.stu_id) as borrowedBook,(SELECT COUNT(*) FROM return_table WHERE return_table.student_id=students.stu_id) as notReturnBook from students LIMIT ?,?`;
    let values = [(Number(obj.paging) - 1) * Number(obj.pageSize), Number(obj.pageSize)]
    await query(sql,values).then((results) => {
        if (results.length > 0) {
            ctx.body = {
                code: 200,
                msg: "全部学生分页查询成功",
                data: results,
                total: results.length
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "全部学生分页查询失败",
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
//查询搜索的学生信息
router.get("/searchStudent", async (ctx) => {
    let obj = ctx.request.query;
    let sql = `SELECT students.stu_id AS id,students.stu_name as name,students.stu_age as age,students.stu_sex as sex,students.stu_pro as domain,students.stu_grade as grade,(SELECT COUNT(*) FROM borrow WHERE borrow.student_id=students.stu_id) as borrowedBook,(SELECT COUNT(*) FROM return_table WHERE return_table.student_id=students.stu_id) as notReturnBook from students WHERE students.stu_name REGEXP ? || students.stu_id REGEXP ?`;
    let values = [obj.searchName,obj.searchID]
    await query(sql, values).then((results) => {
        if (results.length > 0) {
            ctx.body = {
                code: 200,
                msg: "内容查找成功",
                data: results,
                total: results.length
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "内容查找失败",
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
//查询搜索的学生信息分页
router.get("/searchStudentPaging", async (ctx) => {
    let obj = ctx.request.query;
    let sql = `SELECT students.stu_id AS id,students.stu_name as name,students.stu_age as age,students.stu_sex as sex,students.stu_pro as domain,students.stu_grade as grade,(SELECT COUNT(*) FROM borrow WHERE borrow.student_id=students.stu_id) as borrowedBook,(SELECT COUNT(*) FROM return_table WHERE return_table.student_id=students.stu_id) as notReturnBook from students WHERE students.stu_name REGEXP ? || students.stu_id REGEXP ? LIMIT ?,?`;
    let values = [obj.searchName,obj.searchID, (Number(obj.paging) - 1) * Number(obj.pageSize), Number(obj.pageSize)]
    await query(sql, values).then((results) => {
        if (results.length > 0) {
            ctx.body = {
                code: 200,
                msg: "Students login successful",
                data: results,
                total: results.length
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
//添加学生
router.post("/addStudent", async (ctx) => {
    let obj = ctx.request.body.params; //接收表单传来的数据
    let sql = `insert into students (stu_id,stu_sex,stu_name,stu_age,stu_pro,stu_grade) values (?,?,?,?,?,?)`;
    let values = [obj.id, obj.sex, obj.name, obj.age, obj.domain,obj.grade];
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
module.exports = router;