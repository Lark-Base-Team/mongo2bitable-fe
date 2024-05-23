<template>
  <div class="index">
    <div class="content">
      <el-form label-position="top" :model="form" @submit.prevent="onSubmit" label-width="100px">
        <el-form-item label="登录账号" required>
          <el-input v-model="form.loginAccount" placeholder="请输入登录账号"></el-input>
        </el-form-item>
        <el-form-item label="登录密码" required>
          <el-input v-model="form.loginPassword" placeholder="请输入登录密码" show-password></el-input>
        </el-form-item>
        <el-form-item label="数据库IP" required>
          <el-input v-model="form.input1" placeholder="请输入数据库IP"></el-input>
        </el-form-item>
        <el-form-item label="数据库端口号" required>
          <el-input v-model="form.input2" placeholder="请输入数据库端口号"></el-input>
        </el-form-item>
        <el-form-item label="数据库用户名">
          <el-input v-model="form.username" placeholder="请输入数据库用户名"></el-input>
        </el-form-item>
        <el-form-item label="数据库密码">
          <el-input v-model="form.password" placeholder="请输入数据库密码" show-password></el-input>
          <div class="note">（ 注：若数据库开启了访问控制，则需填写数据库用户名和数据库密码，该用户需拥有readAnyDatabase及以上的权限。）</div>
        </el-form-item>
      </el-form>
      <el-button 
        type="primary" 
        :loading="loading" 
        class="submit-button"
        @click="onSubmit"
      >
        提交
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus';
import axios from "axios";
import { useRouter } from "vue-router";
import { BASE_URL } from '../../config';

const router = useRouter();

const form = ref({
  loginAccount: '',
  loginPassword: '',
  input1: '',
  input2: '',
  username: '',
  password: ''
});

const dbName = ref('');
const tableName = ref('');

const loading = ref(false);

const gotopath = (res, input1, input2, username, password, loginAccount, loginPassword) => {

  localStorage.setItem('loginAccount', loginAccount);
  localStorage.setItem('loginPassword', loginPassword);


  console.log('获取成功', res, input1, input2, username, password, loginAccount, loginPassword);
  router.push({
    name: 'options',
    params:{
      res: JSON.stringify(res), 
      input1: input1, 
      input2: input2,
      username: username,
      password: password,
      loginAccount: loginAccount, 
      loginPassword: loginPassword,
      dbname: dbName.value,
      tablename: tableName.value
    }
  });
}

const isValidIPAddress = (ip) => {
  const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipPattern.test(ip) && ip !== '127.0.0.1' && ip !== '0.0.0.0';
};

const isNumeric = (str) => /^[0-9]+$/.test(str);

const showMessage = (message, type = 'success', duration = 2000) => {
  return new Promise((resolve) => {
    ElMessage({
      message: message,
      type: type,
      duration: duration,
      onClose: () => {
        resolve();
      }
    });
  });
};

const fetchUserData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/userdata`, {
      params: { 
        loginAccount: form.value.loginAccount, 
        loginPassword: form.value.loginPassword 
      }
    });
    if (response.data.code == 1) {
      const userData = response.data.data;
      form.value.input1 = userData.IP;
      form.value.input2 = userData.PORT;
      form.value.username = userData.UNAME;
      form.value.password = userData.PWD;
      dbName.value = userData.DBNAME;
      tableName.value = userData.TABLENAME;
    }
  } catch (error) {
    console.error('获取用户数据出错:', error);
  }
};

onMounted(async () => {

  form.value.loginAccount = localStorage.getItem('loginAccount') || '';
  form.value.loginPassword = localStorage.getItem('loginPassword') || '';

  try {
    await fetchUserData();
  } catch (error) {
    console.error('获取用户ID出错:', error);
    ElMessage.error('获取用户ID失败');
  }
});

const onSubmit = async () => {
  if (!form.value.input1 || !form.value.input2 || !form.value.loginAccount || !form.value.loginPassword) {
    if (!form.value.input1) {
      ElMessage.error('数据库公网IP没有填写');
    }
    if (!form.value.input2) {
      ElMessage.error('数据库端口号没有填写');
    }
    if (!form.value.loginAccount) {
      ElMessage.error('登录账号没有填写');
    }
    if (!form.value.loginPassword) {
      ElMessage.error('登录密码没有填写');
    }
    return;
  }

  if (!isValidIPAddress(form.value.input1)) {
    ElMessage.error('数据库公网IP必须是有效的IP格式且不为内网IP');
    return;
  }

  if (!isNumeric(form.value.input2)) {
    ElMessage.error('数据库端口号必须为纯数字');
    return;
  }

  loading.value = true;
  try {
    const response = await axios.get(`${BASE_URL}/connectDB`, {
      params: {
        ip: form.value.input1,
        port: form.value.input2,
        username: form.value.username,
        password: form.value.password,
        loginAccount: form.value.loginAccount,
        loginPassword: form.value.loginPassword
      }
    });

    if (response.data.result) {
      await showMessage('已连接至数据库');
      gotopath(response.data.result, form.value.input1, form.value.input2, form.value.username, form.value.password, form.value.loginAccount, form.value.loginPassword);
    } else {
      ElMessage.error('无法连接至数据库');
    }
  } catch (error) {
    console.error('连接服务器出错:', error);
    ElMessage.error('连接失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.index {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
}
.content {
  width: 80%; 
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
}
.el-form {
  width: 100%; 
}
.submit-button {
  width: 90%;
  margin-top: 20px; 
  font-size: 16px;
}
.note {
  margin-top: 20px;
  font-size: 13px;
  color: #666;
}
</style>
