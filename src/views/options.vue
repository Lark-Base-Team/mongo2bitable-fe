<template>
  <div class="index">
    <div class="content">
      <el-form label-position="top" :model="form" @submit.prevent="onSubmit" label-width="100px">
        <el-form-item label="数据库">
          <el-select v-model="form.input1" placeholder="请选择" @change="onDatabaseChange">
            <el-option v-for="(tables, db) in databaseTables" :key="db" :label="db" :value="db"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="集合（数据表）">
          <el-select v-model="form.input2" placeholder="请选择">
            <el-option v-for="table in currentTables" :key="table" :label="table" :value="table"></el-option>
          </el-select>
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
import { ref, computed, onMounted } from 'vue';
import { ElForm, ElFormItem, ElButton, ElMessage, ElSelect, ElOption } from 'element-plus';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { bitable } from '@lark-base-open/connector-api';
import { BASE_URL } from '../../config';



const route = useRoute();

const form = ref({
  input1: route.params.dbname,
  input2: route.params.tablename
});

const databaseTables = ref({});

const currentTables = computed(() => {
  return databaseTables.value[form.value.input1] || [];
});

const loading = ref(false);

const onDatabaseChange = () => {
  form.value.input2 = '';
};

const onSubmit = async () => {
  if (!form.value.input1 || !form.value.input2) {
    if (!form.value.input1) {
      ElMessage.error('数据库没有选择');
    }
    if (!form.value.input2) {
      ElMessage.error('集合（数据表）没有选择');
    }
    return;
  }

  try {
    loading.value = true;

    const response = await axios.get(`${BASE_URL}/preset`, {
      params: {
        ip: route.params.input1,
        port: route.params.input2, 
        dbName: form.value.input1,
        tableName: form.value.input2,
        username: route.params.username,
        password: route.params.password,
        loginAccount: route.params.loginAccount,
        loginPassword: route.params.loginPassword
      }
    });

    console.log(response)
    if (response.data.code === 0) {
      ElMessage.success('请求成功');
      console.log('响应数据:', response.data.data);
      
      setTimeout(() => {
          bitable.saveConfigAndGoNext({
            loginAccount: route.params.loginAccount,
            loginPassword: route.params.loginPassword
          })
      }, 1000); 
    } else {
      ElMessage.error(`请求失败: ${response.data.message}`);
    }
  } catch (error) {
    ElMessage.error(`请求出错: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  const dataFromRoute = route.params.res;
  
  if (dataFromRoute) {
    try {
      const parsedData = JSON.parse(dataFromRoute);
      const filteredData = Object.keys(parsedData)
        .filter(db => db !== 'admin' && db !== 'config' && db !== 'local')
        .reduce((acc, db) => {
          acc[db] = parsedData[db];
          return acc;
        }, {});
      databaseTables.value = filteredData;
    } catch (e) {
      ElMessage.error('无法解析数据库表信息');
    }
  } else {
    ElMessage.error('未能获取到数据库表信息');
  }
});

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
</style>
