const orderPageList = document.querySelector('.orderPage-tableList');
const discardAllBtn = document.querySelector('.discardAllBtn');
let orderData = [];
let config = {
  headers: {
    'Authorization': token,
  }
}
function init(){
    getOrders();
}
//取出訂單資料
function getOrders(){
    axios.get(`${adminApi}/${apiPath}/orders`,config).then(res=>{
        orderData = res.data.orders;
        ordersList();
        renderC3();
    })
}

//刪除訂單
function deletOrderItem(id){
    axios.delete(`${adminApi}/${apiPath}/orders/${id}`, config)
      .then(function(res){
        alert("刪除該筆訂單成功");
        orderData = res.data.orders;
        ordersList();
        renderC3();
      })
    
}
//刪除全部訂單
function deleteOrderAll(e){
    e.preventDefault();
    if(orderData !== 0){
      axios.delete(`${adminApi}/${apiPath}/orders`,config).then(res=>{
        alert('成功刪除全部訂單');
        orderData = res.data.orders;
        ordersList();
        renderC3();
    }).catch(error=>{
      console.log(error)
    })
    }
}
// 修改訂單
function changeOrderStatus(status,id){
    let newStatus;
    if(status=="true"){
      newStatus=false;
    }else{
      newStatus=true
    }
    axios.put(`${adminApi}/${apiPath}/orders`,{
      "data": {
        "id": id,
        "paid": newStatus
      }
    } ,config)
    .then(function(res){
      alert("修改訂單成功");
      orderData = res.data.orders;
      ordersList();
      renderC3();
    }).catch(error=>{
      console.log(error)
    })
  }
function ordersList(){
    let dataStr = ``;
    orderData.forEach((item)=>{
        const timeStamp = new Date(item.createdAt*1000);
        const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;
        let productStr = "";
        let orderStatus = "";
        item.products.forEach(function(productItem){
            productStr += `<p>${productItem.title}x${productItem.quantity}</p>`
        })    
        if(item.paid==true){
            orderStatus="已處理";
          }else{
            orderStatus = "未處理"
          }
        dataStr += `<tr>
        <td>${item.id}</td>
        <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>${productStr}</td>
        <td>${orderTime}</td>
        <td class="js-orderStatus">
        <a href="#" data-status="${item.paid}" class="orderStatus" data-id="${item.id}">${orderStatus}</a>
        </td>
        <td>
          <input type="button" class="delSingleOrder-Btn" value="刪除" data-id="${item.id}">
        </td>
    </tr>`;
    
    })
    orderPageList.innerHTML = dataStr;
}
function renderC3(){
    let obj = {};
    orderData.forEach(function (item) {
        item.products.forEach(function (productItem) {
        if (obj[productItem.title] === undefined) {
            obj[productItem.title] = productItem.quantity * productItem.price;
        } else {
            obj[productItem.title] += productItem.quantity * productItem.price;

        }
        })
    });  
  // 拉出資料關聯
    let originAry = Object.keys(obj);
  // 透過 originAry，整理成 C3 格式
    let newData = [];
  
    originAry.forEach(function (item) {
        let ary = [];
        ary.push(item);
        ary.push(obj[item]);
        newData.push(ary);
    });
    newData.sort(function (a, b) {
        return b[1] - a[1];
    })
  
  // // 如果筆數超過 4 筆以上，就統整為其它
    if (newData.length > 3) {
        let otherTotal = 0;
        newData.forEach(function (item, index) {
        if (index > 2) {
            otherTotal += newData[index][1];
        }
        })
        newData.splice(3, newData.length - 1);
        newData.push(['其他', otherTotal]);
    }
    c3.generate({
        bindto: '#chart',
        data: {
        columns: newData,
        type: 'pie',
        },
        color: {
        pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"]
        }
    });
}
init();

orderPageList.addEventListener('click',function(e){
    e.preventDefault();
    let targetClass = e.target.getAttribute('class');
    let orderId = e.target.dataset.id;
    if(targetClass == 'delSingleOrder-Btn'){
        deletOrderItem(orderId);
        return;
    }else if (targetClass == "orderStatus"){
      let status = e.target.getAttribute("data-status");
      changeOrderStatus(status,orderId);
      return;
    }  
})
discardAllBtn.addEventListener('click',deleteOrderAll);
