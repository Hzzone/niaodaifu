// pages/cart/cart.js
const app = getApp()
Page({
    data: {
        carts: [],               // 购物车列表
        hasList: false,          // 列表是否有数据
        totalPrice: 0,           // 总价，初始为0
        selectAllStatus: true,    // 全选状态，默认全选
        obj: {
            name: "hello"
        },
    },
    onShow() {
        this.setData({
            hasList: true,
            carts: [
            ]
        });
        wx.request({
            url: 'http://127.0.0.1:8080/cart_detail',
            data: {
                openid: app.globalData.userInfo.openId,

            },
            method: 'post',
            header: {
                'content-type': 'application/x-www-form-urlencoded' // 默认值
            },
            success: res => {
                console.log(res.data)
                var new_carts = []
                for (var i = 0; i < res.data.length;i++){
                    var cart_item = res.data[i]
                    new_carts.push({ "id": cart_item.productId, title: cart_item.product_name, image: cart_item.simple_img_url, num: cart_item.counts, price: cart_item.price, selected: true })
                    
                }
                this.setData({
                    carts: new_carts
                })
                this.getTotalPrice();
            }
        })
        
    },
    /**
     * 当前商品选中事件
     */
    selectList(e) {
        const index = e.currentTarget.dataset.index;
        let carts = this.data.carts;
        const selected = carts[index].selected;
        carts[index].selected = !selected;
        this.setData({
            carts: carts
        });
        this.getTotalPrice();
    },

    /**
     * 删除购物车当前商品
     */
    deleteList(e) {
        const index = e.currentTarget.dataset.index;
        let carts = this.data.carts;
        wx.request({
            url: 'http://127.0.0.1:8080/edit_cart',
            data: {
                openid: app.globalData.userInfo.openId,
                productid: carts[index].id,
                action: 0,
                counts: 0
            },
            method: 'post',
            header: {
                'content-type': 'application/x-www-form-urlencoded' // 默认值
            },
            success: res => {
                console.log(res.data)
            }
        })
        carts.splice(index, 1);
        this.setData({
            carts: carts
        });
        if (!carts.length) {
            this.setData({
                hasList: false
            });
        } else {
            this.getTotalPrice();
        }
        
    },

    /**
     * 购物车全选事件
     */
    selectAll(e) {
        let selectAllStatus = this.data.selectAllStatus;
        selectAllStatus = !selectAllStatus;
        let carts = this.data.carts;

        for (let i = 0; i < carts.length; i++) {
            carts[i].selected = selectAllStatus;
        }
        this.setData({
            selectAllStatus: selectAllStatus,
            carts: carts
        });
        this.getTotalPrice();
    },

    /**
     * 绑定加数量事件
     */
    addCount(e) {
        const index = e.currentTarget.dataset.index;
        let carts = this.data.carts;
        let num = carts[index].num;
        num = num + 1;
        carts[index].num = num;
        this.setData({
            carts: carts
        });
        wx.request({
            url: 'http://127.0.0.1:8080/edit_cart',
            data: {
                openid: app.globalData.userInfo.openId,
                productid: carts[index].id,
                action: 1,
                counts: num
            },
            method: 'post',
            header: {
                'content-type': 'application/x-www-form-urlencoded' // 默认值
            },
            success: res => {
                console.log(res.data)

            }
        })
        this.getTotalPrice();
    },

    /**
     * 绑定减数量事件
     */
    minusCount(e) {
        const index = e.currentTarget.dataset.index;
        const obj = e.currentTarget.dataset.obj;
        let carts = this.data.carts;
        let num = carts[index].num;
        if (num <= 1) {
            return false;
        }
        num = num - 1;
        carts[index].num = num;
        this.setData({
            carts: carts
        });
        console.log(carts[index].id)
        wx.request({
            url: 'http://127.0.0.1:8080/edit_cart',
            data: {
                openid: app.globalData.userInfo.openId,
                productid: carts[index].id,
                action: 1,
                counts: num 
            },
            method: 'post',
            header: {
                'content-type': 'application/x-www-form-urlencoded' // 默认值
            },
            success: res => {
                console.log(res.data)
                
            }
        })
        this.getTotalPrice();
    },

    /**
     * 计算总价
     */
    getTotalPrice() {
        let carts = this.data.carts;                  // 获取购物车列表
        let total = 0;
        for (let i = 0; i < carts.length; i++) {         // 循环列表得到每个数据
            if (carts[i].selected) {                     // 判断选中才会计算价格
                total += carts[i].num * carts[i].price;   // 所有价格加起来
            }
        }
        this.setData({                                // 最后赋值到data中渲染到页面
            carts: carts,
            totalPrice: total.toFixed(2)
        });
    },

    nav: function(){
        var selected_carts = []
        for(var i=0;i<this.data.carts.length;i++){
            if (this.data.carts[i].selected){
                selected_carts.push(this.data.carts[i])
            }
        }
        console.log(selected_carts)
        wx.navigateTo({
            url: '../payment/payment?carts=' + JSON.stringify(selected_carts),
        })
    }

})