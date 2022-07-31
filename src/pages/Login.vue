<template>
    <Toast />
    <div class="surface-0 flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="grid justify-content-center p-2 lg:p-0" style="min-width:80%">
            <loading
                v-model:active="isLoading"
                :can-cancel="true"
                :on-cancel="onCancel"
                :is-full-page="false"
            />
            <div class="col-12 mt-5 xl:mt-0 text-center">
                <img :src="'layout/images/logo-' + logoColor + '.svg'" alt="Sakai logo" class="mb-5" style="width:81px; height:60px;">
            </div>
            <div class="col-12 xl:col-6" style="border-radius:56px; padding:0.3rem; background: linear-gradient(180deg, var(--primary-color), rgba(33, 150, 243, 0) 30%);">
                <div class="h-full w-full m-0 py-7 px-4" style="border-radius:53px; background: linear-gradient(180deg, var(--surface-50) 38.9%, var(--surface-0));">
                    <div class="text-center mb-5">
                        <div class="text-900 text-3xl font-medium mb-3">Employee attendance system</div>
                        <span class="text-600 font-medium">Sign in to continue</span>
                    </div>
                
                    <div class="w-full md:w-10 mx-auto">
                        <label for="email1" class="block text-900 text-xl font-medium mb-2">Username OR Email</label>
                        <InputText id="email1" v-model="login.username" type="text" class="w-full mb-3" placeholder="Username OR Email" style="padding:1rem;" />
                
                        <label for="password1" class="block text-900 font-medium text-xl mb-2">Password</label>
                        <Password id="password1" v-model="login.password" placeholder="Password" :toggleMask="true" class="w-full mb-3" inputClass="w-full" inputStyle="padding:1rem"></Password>
                
                        <Button label="Sign In" class="w-full p-3 text-xl" @click="loginAction"></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import Loading from 'vue3-loading-overlay';
import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';

export default {
    data() {
        return {
            isLoading: false,
            login: {}
        }
    },
    components: {
        Loading
    },
    computed: {
        logoColor() {
            if (this.$appState.darkTheme) return 'white';
            return 'dark';
        }
    },
    methods: {
        async loginAction() {
            const response = await axios.post("login", this.login)
            .catch(error => {
                this.isLoading = false;
                const result = error.response.data;
                this.$toast.add({
                    severity:'error',
                    summary: 'Failed!',
                    detail: result.data.errors,
                    life: 3000
                });
            });

            if(response.data.meta.code == 200){
                this.isLoading = false;
                const result = response.data;
                this.$toast.add({
                    severity:'success',
                    summary: result.meta.message,
                    detail: "success to login system",
                    life: 3000
                });
                localStorage.setItem("token", result.data.token);
                this.$router.push({name: "dashboard"});
            }
        }
    }
}
</script>

<style scoped>
.pi-eye {
    transform:scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform:scale(1.6);
    margin-right: 1rem;
}
</style>