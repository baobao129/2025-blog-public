import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Post from '@/views/Post.vue'
import Admin from '@/views/Admin.vue'
import Editor from '@/views/Editor.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/post/:filename',
    name: 'Post',
    component: Post
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin
  },
  {
    path: '/editor',
    name: 'NewPost',
    component: Editor
  },
  {
    path: '/editor/:filename',
    name: 'EditPost',
    component: Editor
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
