"use strict";

var orderPageList = document.querySelector('.orderPage-tableList');
var orderData = [];

function init() {
  getOrders();
} //取出訂單資料


function getOrders() {
  axios.get("".concat(adminApi, "/").concat(apiPath, "/orders"), {
    headers: {
      'Authorization': token
    }
  }).then(function (res) {
    orderData = res.data.orders;
    ordersList();
    renderC3();
  });
} //刪除訂單


function deletOrderItem(id) {
  axios["delete"]("".concat(adminApi, "/").concat(apiPath, "/orders/").concat(id), {
    headers: {
      'Authorization': token
    }
  }).then(function (response) {
    alert("刪除該筆訂單成功");
    getOrders();
  });
}

function ordersList() {
  var dataStr = "";
  orderData.forEach(function (item) {
    var timeStamp = new Date(item.createdAt * 1000);
    var orderTime = "".concat(timeStamp.getFullYear(), "/").concat(timeStamp.getMonth() + 1, "/").concat(timeStamp.getDate());
    var productStr = "";
    item.products.forEach(function (productItem) {
      productStr += "<p>".concat(productItem.title, "x").concat(productItem.quantity, "</p>");
    });

    if (item.paid == true) {
      orderStatus = "已處理";
    } else {
      orderStatus = "未處理";
    }

    dataStr += "<tr>\n        <td>".concat(item.id, "</td>\n        <td>\n          <p>").concat(item.user.name, "</p>\n          <p>").concat(item.user.tel, "</p>\n        </td>\n        <td>").concat(item.user.address, "</td>\n        <td>").concat(item.user.email, "</td>\n        <td>").concat(productStr, "</td>\n        <td>").concat(orderTime, "</td>\n        <td class=\"orderStatus\">\n          <a href=\"#\" data-status=\"").concat(item.paid, " data-id=\"").concat(item.id, "\">").concat(orderStatus, "</a>\n        </td>\n        <td>\n          <input type=\"button\" class=\"delSingleOrder-Btn\" value=\"\u522A\u9664\" data-id=\"").concat(item.id, "\">\n        </td>\n    </tr>");
  });
  orderPageList.innerHTML = dataStr;
}

function renderC3() {
  var obj = {};
  orderData.forEach(function (item) {
    item.products.forEach(function (productItem) {
      if (obj[productItem.title] === undefined) {
        obj[productItem.title] = productItem.quantity * productItem.price;
      } else {
        obj[productItem.title] += productItem.quantity * productItem.price;
      }
    });
  }); // 拉出資料關聯

  var originAry = Object.keys(obj); // 透過 originAry，整理成 C3 格式

  var newData = [];
  originAry.forEach(function (item) {
    var ary = [];
    ary.push(item);
    ary.push(obj[item]);
    newData.push(ary);
  });
  newData.sort(function (a, b) {
    return b[1] - a[1];
  }); // // 如果筆數超過 4 筆以上，就統整為其它

  if (newData.length > 3) {
    var otherTotal = 0;
    newData.forEach(function (item, index) {
      if (index > 2) {
        otherTotal += newData[index][1];
      }
    });
    newData.splice(3, newData.length - 1);
    newData.push(['其他', otherTotal]);
  }

  c3.generate({
    bindto: '#chart',
    data: {
      columns: newData,
      type: 'pie'
    },
    color: {
      pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"]
    }
  });
}

init();
orderPageList.addEventListener('click', function (e) {
  e.preventDefault();
  var targetClass = e.target.getAttribute('class');
  var orderId = e.target.getAttribute('data-id');

  if (targetClass == 'delSingleOrder-Btn') {
    deletOrderItem(orderId);
    return;
  }
});