<!-- pages/admin/change-password.vue -->
<template>
  <div class="flex justify-center items-start w-full">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-8 my-16">
      <h2 class="text-xl font-semibold mb-4">修改密碼</h2>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block text-gray-700">新密碼</label>
          <input
            v-model="newPassword"
            type="password"
            class="w-full px-3 py-2 border rounded"
            required
            minlength="6"
          />
        </div>
        <button
          type="submit"
          class="py-2 px-4 bg-gray-900 text-white rounded hover:bg-gray-800"
        >
          {{ loading ? '提交中...' : '確認修改' }}
        </button>
      </form>
      <p v-if="successMsg" class="mt-3 text-green-600">{{ successMsg }}</p>
      <p v-if="errorMsg" class="mt-3 text-red-500">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '~/composables/useAuth';

definePageMeta({
  requiresAuth: true,  // ← 打开保护
  layout: 'admin',     // ← 使用 admin 布局（可选）
})

const { changePassword } = useAuth();
const newPassword = ref('');
const errorMsg = ref('');
const successMsg = ref('');
const loading = ref(false);

const onSubmit = async () => {
  errorMsg.value = '';
  successMsg.value = '';
  loading.value = true;
  try {
    await changePassword(newPassword.value);
    successMsg.value = '密碼已修改成功';
    newPassword.value = '';
  } catch (err: any) {
    errorMsg.value = err?.data?.message || '修改失敗';
  } finally {
    loading.value = false;
  }
};
</script>