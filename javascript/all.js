const productSelect = document.querySelector('.productSelect');
const productWrap = document.querySelector('.productWrap');
const totalPrice =  document.querySelector(".js-total");
const shoppingCartTableList = document.querySelector('.shoppingCart-tableList');
const discardAllBtn = document.querySelector('.discardAllBtn');
const orderInfoForm = document.querySelector('.orderInfo-form');
const orderInfoMessage = document.querySelectorAll('.orderInfo-message'); //陣列 
let productData = [];
let cartData = [];
//商品頁面初始化
function init(){
    getData();
    getCarts();
}
//取得商品資料
function getData(){
    axios.get(`${api}/${apiPath}/products`).then(res=>{
        productData = res.data.products;
        getCategories();
        renderProducts(productData);
    }).catch(error=>{
        console.log(error)
    })
}
//篩選品項
function listChange(e){
    let list = e.target.value;
    if(list == '全部'){
        renderProducts(productData);
        return;
    }
    let changeProducts = [];
    productData.forEach((item)=> {
     if(item.category == list) {
       changeProducts.push(item);
     }
  })
  renderProducts(changeProducts); 
}
//從陣列裡取值重新排列成新的陣列
function getCategories(){
    let uniSort = productData.map(item=>{
        return item.category;
    })
    let sorted = uniSort.filter((item,index)=>{
        return uniSort.indexOf(item) == index;
    })
    renderCategories(sorted);
}
//渲染選單資料
function renderCategories(sorted){
    let str= `<option value="全部" selected>全部</option>`;
    sorted.forEach(item=>{
        str+= `<option value="${item}">${item}</option>`
    })
    productSelect.innerHTML = str;
}
//取得購物車資料
function getCarts(){
    axios.get(`${api}/${apiPath}/carts`).then(res=>{
        cartData = res.data.carts;
        totalPrice.textContent = toThousands(res.data.finalTotal);
        cartsRender();
    }).catch(error=>{
        console.log(error)
    })
}
//刪除品項
function deleteCarts(e){
    e.preventDefault();
    const cartId = e.target.dataset.id;
    if(cartId === undefined){
        return;
    }
    axios.delete(`${api}/${apiPath}/carts/${cartId}`).then(res=>{
        alert('成功刪除訂單');
        cartData = res.data.carts;
        totalPrice.textContent = toThousands(res.data.finalTotal);
        cartsRender();
    })  .catch(error=>{
        alert("無法刪除訂單")
    })      
}
//刪除全部品項
function deleteCartsAll(e){
    e.preventDefault();
    if(cartData.length !== 0){
        axios.delete(`${api}/${apiPath}/carts`).then(res=>{
            alert('已刪除全部訂單')
            cartData = res.data.carts;
            totalPrice.textContent = toThousands(res.data.finalTotal);
            cartsRender();
        }).catch(error=>{
            alert('購物車已清空，請勿重複點擊');
        })
    }
}
//加入購物車
function addCarts(e){
    e.preventDefault();
    let addCartId = e.target.getAttribute('id');
    let productId = e.target.dataset.id;
	let quantity = 1;
    if(addCartId !== "addCardBtn"){
        return;
    }
    cartData.forEach((item) => {
        if(item.product.id === productId){
            quantity = item.quantity +=1;
            console.log(e.target.id)
        }
    });
	let data = { data: { productId, quantity } };
    axios.post(`${api}/${apiPath}/carts`,data).then(res=>{
        alert("加入到購物車")
        cartData = res.data.carts;
        totalPrice.textContent = toThousands(res.data.finalTotal);
        cartsRender();
    }).catch(error=>{
        console.log(error)
    })
}
//送出訂單
function postOrder(e){
    e.preventDefault();
    const customerName = document.querySelector('#customerName');
    const customerPhone = document.querySelector('#customerPhone');
    const customerEmail = document.querySelector('#customerEmail');
    const customerAddress = document.querySelector('#customerAddress');
    const tradeWay = document.querySelector('#tradeWay');
    const nameCode = /[^\u4e00-\u9fa5-\a-zA-Z]/;
    const telCode = /^[0-9\-]{7,11}$/;
    const emailCode = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9])+$/;

    if(cartData.length === 0){
        alert('購物車尚未加入商品');
    }else{
        if(customerName.value ===''||nameCode.test(customerName.value)||customerName.value.length <2){
            orderInfoMessage[0].textContent = '必填';
            customerName.focus();
        }else if(customerPhone.value ===''){
            orderInfoMessage[0].textContent = '';
            orderInfoMessage[1].textContent = '必填';
            customerPhone.focus();
        }else if (!telCode.test(customerPhone.value)) {
            orderInfoMessage[0].textContent = '';
            orderInfoMessage[1].textContent = '電話號碼輸入有誤';
            customerPhone.focus();
        }else if (customerEmail.value === '' || !emailCode.test(customerEmail.value)) {
            orderInfoMessage[1].textContent = '';
            orderInfoMessage[2].textContent = '請輸入 Email';
            customerEmail.focus();
        } else if (customerAddress.value === '') {
            orderInfoMessage[2].textContent = '';
            orderInfoMessage[3].textContent = '請輸入地址';
            customerAddress.focus();
        }else{
            let obj = {
                user:{
                    name: customerName.value.trim(),
                    tel: customerPhone.value.trim(),
                    email: customerEmail.value.trim(),
                    address: customerAddress.value.trim(),
                    payment: tradeWay.value    
                }
            };
            axios.post(`${api}/${apiPath}/orders`,{ data: obj }).then(res=>{
                alert('訂單建立成功')
                orderInfoForm.reset();
                orderInfoMessage[0].textContent = "";
                orderInfoMessage[1].textContent = "";
                orderInfoMessage[2].textContent = "";
                orderInfoMessage[3].textContent = "";

                getCarts();
            }).catch(error=>{
                alert('訂單建立失敗')
            })
        }
    }
}
//商品資料渲染
function renderProducts(product){
    let dataStr = ``;
    product.forEach((item,index) => {
    dataStr += `
    <li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="picture${index+1}">
    <a href="#" id="addCardBtn" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
    <p class="nowPrice">NT$${toThousands(item.price)}</p>
    </li>
    `
    });
    productWrap.innerHTML = dataStr;  
};
//購物車資料渲染
function cartsRender(){
    let dataStr = ``;
    cartData.forEach(item=>{
        dataStr += `
                <tr>
                    <td>
                        <div class="cardItem-title">
                            <img src="${item.product.images}" alt="">
                            <p>${item.product.title}</p>
                        </div>
                    </td>
                    <td>NT$${toThousands(item.product.price)}</td>
                    <td>${item.quantity}</td>
                    <td>NT$${toThousands(item.product.price*item.quantity)}</td>
                    <td class="discardBtn">
                        <a href="#" class="material-icons" data-id="${item.id}">
                            clear
                        </a>
                    </td>
                </tr>` ;
    })
    shoppingCartTableList.innerHTML = dataStr
}
init();
productSelect.addEventListener('change',listChange);
productWrap.addEventListener("click", addCarts);
shoppingCartTableList.addEventListener('click',deleteCarts);
discardAllBtn.addEventListener("click",deleteCartsAll)
orderInfoForm.addEventListener('submit',postOrder);

function toThousands(x) {
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}
