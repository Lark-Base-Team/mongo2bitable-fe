import { createRouter,createWebHistory } from "vue-router";
import index from "@/views/index.vue";
import options from "@/views/options.vue";

const routes = [{
    path: "/",
    component: () => import("../views/index.vue")
},{
    path: "/options/:res/input1/:input1/input2/:input2/username/:username?/password/:password?/loginAccount:loginAccount/loginPassword:loginPassword/dbname/:dbname?/tablename/:tablename?",
    name: 'options',
    component: () => import("../views/options.vue")
}]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router