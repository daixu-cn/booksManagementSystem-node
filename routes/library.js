const router = require("koa-router")();
const query = require("../module/query");
const sd = require('silly-datetime');
const moment = require('moment');

router.get("/", function (ctx) {
    ctx.body = "图书馆首页"
});
//查询所有图书信息
router.get("/allBook", async (ctx) => {
    let sql = `SELECT book.book_id AS id,book.book_name AS name,book.book_author AS author,book_sort.sort_name AS sort,book.book_pub AS publishingHouse,book.is_on AS isLibrary from book LEFT JOIN book_sort ON book_sort.sort_id=book.book_sort_id order by book.book_id ASC`;;
    await query(sql).then((results) => {
        if (results.length > 0) {
            ctx.body = {
                code: 200,
                msg: "全部图书查询成功",
                data: results,
                total: results.length
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "全部图书查询失败",
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
//查询所有借阅的图书信息
router.get("/allBorrowBook", async (ctx) => {
    let sql = `SELECT book.book_id as id,borrow.student_id as student_id,book.book_name AS name,book.book_author AS author,book_sort.sort_name AS sort,book.book_pub AS publishingHouse, borrow.borrow_date AS outDate,borrow.expect_return_date AS returnDate from book LEFT JOIN book_sort ON book.book_sort_id=book_sort.sort_id LEFT JOIN borrow ON borrow.book_id=book.book_id WHERE book.is_on = 0 order by borrow.borrow_date desc`;
    await query(sql).then((results) => {
        if (results.length > 0) {
            results.map(item => {
                item.outDate = moment(item.outDate).format('YYYY-MM-DD');
                item.returnDate = moment(item.returnDate).format('YYYY-MM-DD');
                return item;
            })
            ctx.body = {
                code: 200,
                msg: "借阅图书查询成功",
                data: results,
                total: results.length
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "借阅图书查询失败",
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
//查询指定搜索的信息
router.get("/searchBook", async (ctx) => {
    let obj = ctx.request.query;
    let sql = `SELECT book.book_id AS id,book.book_name AS name,book.book_author AS author,book_sort.sort_name AS sort,book.book_pub AS publishingHouse,book.is_on AS isLibrary from book LEFT JOIN book_sort ON book_sort.sort_id=book.book_sort_id WHERE book.book_name REGEXP ? || book.book_author REGEXP ? || book.book_pub REGEXP ? order by book.book_id ASC`;;
    let values = [obj.searchName, obj.searchAuthor, obj.searchPublishingHouse]
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
//查询指定搜索的分页信息
router.get("/searchBookPaging", async (ctx) => {
    let obj = ctx.request.query;
    let sql = `SELECT book.book_id AS id,book.book_name AS name,book.book_author AS author,book_sort.sort_name AS sort,book.book_pub AS publishingHouse,book.is_on AS isLibrary from book LEFT JOIN book_sort ON book_sort.sort_id=book.book_sort_id WHERE book.book_name REGEXP ? || book.book_author REGEXP ? || book.book_pub REGEXP ? order by book.book_id ASC LIMIT ?,?`;
    let values = [obj.searchName, obj.searchAuthor, obj.searchPublishingHouse, (Number(obj.paging) - 1) * Number(obj.pageSize), Number(obj.pageSize)]
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
//查询所有图书分页信息
router.get("/l_paging", async (ctx) => {
    await ctx.render("../views/library/l_paging");
})
router.get("/allBookPaging", async (ctx) => {
    let obj = ctx.request.query;
    let sql = `SELECT book.book_id AS id,book.book_name AS name,book.book_author AS author,book_sort.sort_name AS sort,book.book_pub AS publishingHouse,book.is_on AS isLibrary from book LEFT JOIN book_sort ON book_sort.sort_id=book.book_sort_id order by book.book_id ASC LIMIT ?,?`;
    let values = [(Number(obj.paging) - 1) * Number(obj.pageSize), Number(obj.pageSize)];
    await query(sql, values).then((results) => {
        if (results.length > 0) {
            ctx.body = {
                code: 200,
                msg: "Students login successful",
                data: results
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
//借阅表图书增加
// router.get("/l_borrowadd", async (ctx) => {
//     await ctx.render("../views/library/l_borrowadd");
// })
router.get("/l_borrowadd", async (ctx) => {
    let obj = ctx.request.query; //接收表单传来的数据
    if (!obj.bookId) {
        ctx.body = {
            code: 402,
            msg: "图书编号为空"
        };
        return;
    };
    if (!obj.studentId) {
        ctx.body = {
            code: 401,
            msg: "学号为空"
        };
        return;
    };
    let isBook = await query("SELECT * from book WHERE book_id = ?", [Number(obj.bookId)]);
    if (isBook.length <= 0) {
        ctx.body = {
            code: 403,
            msg: `没有找到编号为${obj.bookId}的图书`
        };
        return;
    }
    let isStudent = await query("SELECT * from students WHERE stu_id = ?", [obj.studentId]);
    if (isStudent.length <= 0) {
        ctx.body = {
            code: 404,
            msg: `没有找到编号为${obj.studentId}的学生`
        };
        return;
    }
    let isOn = await query("SELECT * from book WHERE book_id=? AND is_on=0", [obj.bookId]);
    if (isOn.length > 0) {
        ctx.body = {
            code: 405,
            msg: `编号为${obj.bookId}的图书已经借出`
        };
        return;
    }
    let time = sd.format(new Date(), 'YYYY-MM-DD') //借书时间
    let year = Number(time[0] + time[1] + time[2] + time[3]); //还书年
    let month = ""; //还书月
    let day = time[8] + time[9] //还书日
    if (Number(time[5] + time[6]) >= 9) { //如果还书月份大于等于9则年份加一，月份重置
        year++;
        for (var i = 9; i <= 12; i++) {
            if (Number(time[5] + time[6]) == i) { //如果还书月份刚好等于9,10,11,12其中一天
                month = time[5] + (i + 4 - 12) //还书月份重置
                break;
            }
        }
    } else { //如果还书月份小于9则不需要重置直接加上4
        month = "0" + (Number(time[5] + time[6]) + 4)
    }
    let time1 = year + "-" + month + "-" + day;
    let sql = `insert into borrow (student_id,book_id,borrow_date,expect_return_date) values (?,?,?,?)`;
    let values = [obj.studentId, obj.bookId, time, time1];
    await query(sql, values).then(async (results) => {
        if (results.affectedRows > 0) {
            await query("update book set is_on=0 WHERE book_id=?", [obj.bookId]).then(res => {
                if (results.affectedRows > 0) {
                    ctx.body = {
                        code: 200,
                        msg: "借书成功",
                        data: {
                            student_id: obj.student_id,
                            book_id: obj.book_id
                        }
                    };
                }
            })
        } else {
            ctx.body = {
                code: 201,
                msg: "借书失败"
            };
        }
    }, (err) => {
        ctx.body = {
            code: 201,
            msg: "服务器异常",
            reason: err
        };
    });
})

//借阅表删除
// router.get("/l_borrowdelete", async (ctx) => {
//     await ctx.render("../views/library/l_borrowdelete");
// })
// router.get("/l_borrowdelete1", async (ctx) => {
//     let obj = ctx.request.query; //接收表单传来的数据
//     if (!obj.student_id) {
//         ctx.body = {
//             code: 401,
//             msg: "student_id required"
//         };
//         return;
//     };
//     let sql = `delete from borrow where student_id=? and book_id=?`;
//     let values = [obj.student_id, obj.book_id];
//     await query(sql, values).then((results) => {
//         if (results.affectedRows > 0) {
//             ctx.body = {
//                 code: 200,
//                 msg: "borrow delete successful",
//                 data: {
//                     student_id: obj.student_id,
//                     book_id: obj.book_id
//                 }
//             };
//         } else {
//             ctx.body = {
//                 code: 201,
//                 msg: "borrow delete error"
//             };
//         }
//     }, (err) => {
//         ctx.body = {
//             code: 201,
//             msg: "borrow delete error",
//             reason: err
//         };
//     });

// })

//还书表增加
// router.get("/l_returntable_add", async (ctx) => {
//     await ctx.render("../views/library/l_returntable_add");

//     function convertDateFromString(dateString) {
//         if (dateString) {
//             var date = new Date(dateString.replace(/-/, "/"))
//             return date;
//         }
//     }
//     console.log(typeof sd.format(new Date(), 'YYYY-MM-DD'))
//     console.log(convertDateFromString("2020-12-12") - convertDateFromString("2020-11-10"))
// })
router.get("/l_returntable_add", async (ctx) => {
    let obj = ctx.request.query; //接收表单传来的数据
    if (!obj.bookId) {
        ctx.body = {
            code: 402,
            msg: "图书编号为空"
        };
        return;
    };
    if (!obj.studentId) {
        ctx.body = {
            code: 401,
            msg: "学号为空"
        };
        return;
    };
    let isBook = await query("SELECT * from book WHERE book_id = ?", [Number(obj.bookId)]);
    if (isBook.length <= 0) {
        ctx.body = {
            code: 403,
            msg: `没有找到编号为${obj.bookId}的图书`
        };
        return;
    }
    let isStudent = await query("SELECT * from students WHERE stu_id = ?", [obj.studentId]);
    if (isStudent.length <= 0) {
        ctx.body = {
            code: 404,
            msg: `没有找到编号为${obj.studentId}的学生`
        };
        return;
    }
    let isBorrowBook = await query("SELECT * from borrow WHERE book_id=? and student_id=?", [Number(obj.bookId), obj.studentId]);
    if (isBorrowBook.length <= 0) {
        ctx.body = {
            code: 405,
            msg: `编号为${obj.bookId}的图书不需要归还`
        };
        return;
    }
    await query("SELECT * from borrow WHERE book_id=? and student_id=?", [Number(obj.bookId), obj.studentId]).then(async (result) => {
        let overtime = await

        function isTimeout() {
            let expect_return_date = moment(result[0].expect_return_date).format('YYYY-MM-DD');
            let date1 = new Date(expect_return_date)
            let date2 = new Date()
            let s1 = date1.getTime()
            let s2 = date2.getTime();
            let total = (s2 - s1) / 1000;
            return parseInt(total / (24 * 60 * 60))
        }()
        let BookPrice = await query("SELECT * from book WHERE book_id=?", [Number(obj.bookId)])
        let penalty = 0.5 * Number(overtime)
        if (penalty > BookPrice[0].book_price) {
            penalty = BookPrice[0].book_price
        }
        if (overtime > 0) {
            ctx.body = {
                code: 406,
                msg: "图书归还超时,收取罚款",
                overtime,
                penalty,
                borrowId: result[0].borrow_id
            }
        } else {
            let sql = `insert into return_table (student_id,book_id,borrow_id,return_date) values (?,?,?,?)`;
            let values = [obj.studentId, Number(obj.bookId), result[0].borrow_id, sd.format(new Date(), 'YYYY-MM-DD')];
            await query(sql, values).then(async (results2) => {
                if (results2.affectedRows > 0) {
                    await query("UPDATE book SET is_on=1 where book_id=?", [Number(obj.bookId)]).then(results3 => {
                        if (results2.affectedRows > 0) {
                            ctx.body = {
                                code: 200,
                                msg: "还书成功!"
                            };
                        }
                    })
                } else {
                    ctx.body = {
                        code: 201,
                        msg: "还书失败!"
                    };
                }
            }, (err) => {
                ctx.body = {
                    code: 201,
                    msg: "服务器异常!",
                    reason: err
                };
            });
        }
    })
})

//处罚表增加
// router.get("/l_ticketadd", async (ctx) => {
//     await ctx.render("../views/library/l_ticketadd");
// })
router.get("/l_ticketadd", async (ctx) => {
    let obj = ctx.request.query; //接收表单传来的数据
    let sql = `insert into return_table (student_id,book_id,borrow_id,return_date) values (?,?,?,?)`;
    let values = [obj.studentId, Number(obj.bookId), obj.borrowId, sd.format(new Date(), 'YYYY-MM-DD')];
    await query(sql, values).then(async (results2) => {
        if (results2.affectedRows > 0) {
            await query("UPDATE book SET is_on=1 where book_id=?", [Number(obj.bookId)]).then(results3 => {
                if (results2.affectedRows > 0) {
                    ctx.body = {
                        code: 200,
                        msg: "还书成功!"
                    };
                }
            })
        } else {
            ctx.body = {
                code: 201,
                msg: "还书失败!"
            };
        }
    });
    await query("insert into ticket (student_id,book_id,over_date,ticket_price) values (?,?,?,?)", [obj.studentId, obj.bookId, obj.overtime, obj.penalty]).then((results) => {
        ctx.body = {
            code: 200,
            msg: "处罚表信息添加成功"
        }
    })
})

//处罚表信息删除
router.get("/l_borrowdel", async (ctx) => {
    await ctx.render("../views/library/l_borrowdel");
})
router.get("/l_borrowdel1", async (ctx) => {
    let obj = ctx.request.query; //接收表单传来的数据
    if (!obj.student_id) {
        ctx.body = {
            code: 401,
            msg: "student_id required"
        };
        return;
    };
    if (!obj.book_id) {
        ctx.body = {
            code: 402,
            msg: "book_id required"
        };
        return;
    };
    let sql = `delete from ticket where student_id=? and book_id=?`;
    let values = [obj.student_id, obj.book_id];
    await query(sql, values).then((results) => {
        if (results.affectedRows > 0) {
            ctx.body = {
                code: 200,
                msg: "ticket delete successful",
                data: {
                    student_id: obj.student_id,
                    book_id: obj.book_id
                }
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "ticket delete error"
            };
        }
    }, (err) => {
        ctx.body = {
            code: 201,
            msg: "ticket delete error",
            reason: err
        };
    });

})
//查询所有学生已还的全部图书
router.get("/allReturnBook", async (ctx) => {
    let sql = `SELECT book.book_id as id,return_table.student_id AS student_id, book.book_name AS name,book.book_author AS author,book_sort.sort_name AS sort,book.book_pub AS publishingHouse,return_table.return_date AS returnDate from  book LEFT JOIN book_sort ON book.book_sort_id=book_sort.sort_id LEFT JOIN return_table ON return_table.book_id=book.book_id WHERE return_table.return_date is NOT NULL order by return_table.return_date DESC`;
    await query(sql).then((results) => {
        results.map(item => {
            item.returnDate = moment(item.returnDate).format('YYYY-MM-DD');
            return item;
        })
        if (results.length > 0) {
            ctx.body = {
                code: 200,
                msg: "归还图书查询成功",
                data: results,
                total: results.length
            };
        } else {
            ctx.body = {
                code: 200,
                data: [],
                msg: "归还图书为零",
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
//图书删除
router.post("/delBook", async (ctx) => {
    let obj = ctx.request.body.params; //接收表单传来的数据
    await query('SELECT * FROM book LEFT JOIN book_sort ON book.book_sort_id=book_sort.sort_id WHERE book.book_id=?', [obj.id]).then(async (res) => {
        if (res.length > 0) {
            if (obj.classify == res[0].sort_id) {
                let sql = `delete from book where book_id=?`;
                let values = [obj.id];
                await query(sql, values).then((results) => {
                    if (results.affectedRows > 0) {
                        ctx.body = {
                            code: 200,
                            msg: "删除成功",
                        };
                    } else {
                        ctx.body = {
                            code: 203,
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
            } else {
                ctx.body = {
                    code: 202,
                    msg: '没有权限操作其他类书籍'
                }
            }
        } else {
            ctx.body = {
                code: 201,
                msg: '该图书不存在'
            }
        }
    })
})
//查询图书分类
router.get("/bookSort", async (ctx) => {
    let sql = `SELECT * FROM book_sort`;
    await query(sql).then((results) => {
        if (results.length > 0) {
            ctx.body = {
                code: 200,
                msg: "图书分类查询成功",
                data: results
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "图书分类查询失败",
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
//图书增加
router.get("/addBook", async (ctx) => {
    let obj = ctx.request.query; //接收表单传来的数据
    let sql = `insert into book (book_name,book_author,book_price,pagination,book_sort_id,subhead,book_pub,publicationTime) values (?,?,?,?,?,?,?,?)`;
    let values = [obj.name, obj.author, obj.price, obj.pagination, obj.sort, obj.subhead, obj.publishingHouse, obj.publicationTime];
    await query(sql, values).then(results => {
        if (results.affectedRows > 0) {
            ctx.body = {
                code: 200,
                msg: "图书添加成功!"
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "图书添加失败!"
            };
        }
    }, (err) => {
        ctx.body = {
            code: 301,
            msg: "服务器异常!",
            reason: err
        };
    });
})
//获取当前图书信息
router.get("/bookInfo", async (ctx) => {
    let obj = ctx.request.query; //接收表单传来的数据
    let sql = `select * from book INNER JOIN book_sort ON book.book_sort_id = book_sort.sort_id where book.book_id=?`;
    let values = [obj.bookId];
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
//图书评分
router.get("/grade", async (ctx) => {
    let obj = ctx.request.query; //接收表单传来的数据
    let sql = `insert into forum (bookId,studentId,grade) values (?,?,?)`;
    let values = [obj.bookId, obj.studentId, obj.grade];
    await query(sql, values).then(results => {
        if (results.affectedRows > 0) {
            ctx.body = {
                code: 200,
                msg: "图书评分成功!"
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "图书评分失败!"
            };
        }
    }, (err) => {
        ctx.body = {
            code: 301,
            msg: "服务器异常!",
            reason: err
        };
    });
})
//查询学生对当前数据是否评分
router.get("/isGrade", async (ctx) => {
    let sql = `SELECT * FROM forum WHERE bookId=? and studentId=? and grade IS NOT NULL`;
    let obj = ctx.request.query;
    let values = [obj.bookId, obj.studentId]
    await query(sql, values).then((results) => {
        if (results.length > 0) {
            ctx.body = {
                code: 200,
                msg: "已经评分过",
                grade: results[0].grade
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "还没有评分",
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
//查询当前图书有多少人评分
router.get("/gradeNum", async (ctx) => {
    let sql = `SELECT * FROM forum WHERE bookId=? and grade IS NOT NULL`;
    let obj = ctx.request.query;
    let values = [obj.bookId]
    await query(sql, values).then((results) => {
        if (results.length > 0) {
            ctx.body = {
                code: 200,
                msg: "查询成功",
                gradeNum: results.length
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "查询失败",
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
//查询当前图书有多少人评分
router.get("/avgGrade", async (ctx) => {
    let sql = `SELECT avg(grade) as avg FROM forum WHERE bookId=? and grade IS NOT NULL`;
    let obj = ctx.request.query;
    let values = [obj.bookId]
    await query(sql, values).then((results) => {
        if (results.length > 0) {
            if (results[0].avg === null) {
                results[0].avg = 0
            }
            ctx.body = {
                code: 200,
                msg: "查询成功",
                avg: parseFloat(results[0].avg).toFixed(1)
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "查询失败",
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
//查看当前图书的评论
router.get("/getComments", async (ctx) => {
    let obj = ctx.request.query;
    let results = await query('select * FROM forum where bookId=? and container is not null ORDER BY releaseTime DESC LIMIT 0,?;', [obj.bookId,Number(obj.page)*10]);
    let arr = []
    let results3 = await query('SELECT COUNT(*) as total FROM forum where bookId=? and container is not null', [obj.bookId]);
    if (results.length > 0) {
        await results.map(async (item) => {
            arr.push(item.studentId)
            let time = sd.format(item.releaseTime, 'YYYY-MM-DD')
            item.releaseTime=time
            var str = item.student_img.slice(0,7)
            if(item.student_img.slice(0,7)==="upload_"){
                item.student_img="http://127.0.0.1:3000/uploads/"+item.student_img
            }
        })
        for (let i = 0; i < arr.length; i++) {
            let results2 = await query('select * FROM forum where bookId=? and studentId=? and grade is not null', [obj.bookId,arr[i]]);
            results[i].grade = results2[0].grade
        }
        ctx.body={
            code:200,
            msg:'查询成功',
            data:results,
            total:results3[0].total
        }
    }else{
        ctx.body={
            code:201,
            msg:'该本图书没有评论'
        }
    }
})
//增加当前图书评论
router.get("/addComment", async (ctx) => {
    let obj = ctx.request.query; //接收表单传来的数据
    let sql = `insert into forum (bookId,studentId,student_img,student_name,releaseTime,title,container) values (?,?,?,?,?,?,?)`;
    let values = [obj.bookId, obj.studentId, obj.student_img, obj.student_name, obj.releaseTime, obj.title, obj.container];
    await query(sql, values).then(results => {
        if (results.affectedRows > 0) {
            ctx.body = {
                code: 200,
                msg: "评论添加成功!"
            };
        } else {
            ctx.body = {
                code: 201,
                msg: "评论添加失败!"
            };
        }
    }, (err) => {
        ctx.body = {
            code: 301,
            msg: "服务器异常!",
            reason: err
        };
    });
})
//测试接口
router.get("/test", async (ctx) => {
    ctx.body={
        code:200,
        msg:"测试接口调用成功",
        data:{
            file:ctx.request.query.file
        }
    }
})
module.exports = router;