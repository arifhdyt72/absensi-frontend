<template>
    <div class="grid">
        <Toast/>
        
        <div class="col-12">
            <router-view @refreshTable="refresh"></router-view>
        </div>
        <div class="col-12">
			<div class="card">
                <h5>Users Data</h5>
                <DataTable 
                    :lazy="true" 
                    :paginator="true" 
                    :scrollable="true"
                    scrollHeight="flex"
                    :wrapper="true"
                    :rows="10"
                    :value="users" 
                    :totalRecords="totalRecords"
                    :loading="loading"
                    @page="onPage($event)"
                    @sort="onSort($event)"
                    @filter="onFilter($event)"
                    ref="dt" 
                    dataKey="id"
                    responsiveLayout="scroll" 
                >
                    <Toolbar class="mb-4">
                        <template v-slot:start>
                            <div class="my-2">
                                <Button label="New" icon="pi pi-plus" class="p-button-success mr-2" @click="newData" />
                            </div>
                        </template>

                        <template v-slot:end>
                            <div class=" justify-content-between">
                                <!-- <Button type="button" icon="pi pi-filter-slash" label="Clear" class="p-button-outlined" @click="clearFilter()"/> -->
                                <span class="p-input-icon-left">
                                    <i class="pi pi-search" />
                                    <InputText v-model="filters" placeholder="Keyword Search" @keydown.enter="onFilter()"/>
                                </span>
                            </div>
                        </template>
                    </Toolbar>
                    <Column v-for="col of columns" :field="col.field" :header="col.header" :key="col.field" :sortable="true" :style="col.style" />
                    <Column headerStyle="min-width:10rem;" frozen alignFrozen="right">
						<template #body="slotProps">
							<Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editData(slotProps.data)" />
							<Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDelete(slotProps.data)" />
						</template>
					</Column>
                </DataTable>
                <!-- Delete Dialog -->
                <Dialog v-model:visible="deleteDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
					<div class="flex align-items-center justify-content-center">
						<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
						<span v-if="user">Are you sure you want to delete <b>{{user.fullname}}</b>?</span>
					</div>
					<template #footer>
						<Button label="No" icon="pi pi-times" class="p-button-secondary " @click="deleteDialog = false"/>
						<Button label="Yes" icon="pi pi-check" class="p-button-danger" @click="deleteData" />
					</template>
				</Dialog>
                <!-- user Dialog -->
                <Dialog v-model:visible="usersDialog" :style="{width: '500px'}" header="Form User" :modal="true" class="p-fluid">
					<div class="field">
						<label for="username">Username</label>
						<InputText id="username" placeholder="Username" v-model.trim="user.username" required="true" autofocus :class="{'p-invalid': submitted && !user.username}" />
						<small class="p-invalid-text" v-if="(submitted || submittedUpdate) && !user.username">User Name is required.</small>
					</div>
                    <div class="field">
                        <label for="password">Password</label>
                        <div class="p-inputgroup">
                            <InputText
                                id="password"
                                v-bind:class="submitted && !user.password ? 'p-invalid' : ''" v-model="user.password"
                                v-bind:type="eyeHidden ? 'password' : 'text' "
                                placeholder="Password"
                            />
                            <Button
                                v-bind:icon="eyeHidden ? 'pi pi-eye' : 'pi pi-eye-slash' "
                                class="p-button-primary"
                                @click="!eyeHidden ? eyeHidden = true : eyeHidden = false;"
                            />
                        </div>
                        <small class="p-invalid-text" v-if="submitted && !user.password">Password is required.</small>
					</div>
                    <div class="field">
						<label for="fullname">Fullname</label>
						<InputText id="fullname" placeholder="Fullname" v-model.trim="user.fullname" autofocus :class="{'p-invalid': submitted && !user.fullname}" />
                        <small class="p-invalid-text" v-if="(submitted || submittedUpdate) && !user.fullname">Fullname is required.</small>
					</div>
                    <div class="field">
						<label for="email">Email</label>
						<InputText id="email" type="email" placeholder="Email" v-model.trim="user.email" autofocus :class="{'p-invalid': submitted && !user.email}" />
                        <small class="p-invalid-text" v-if="(submitted || submittedUpdate) && !user.email">Email is required.</small>
					</div>
                    <div class="field">
						<label for="level">Role</label>
                        <Dropdown v-model="ruleSelected" :options="rulesLevel" optionLabel="name" optionValue="code" placeholder="Select" autofocus :class="{'p-invalid': submitted && !ruleSelected}"/>
						<small class="p-invalid-text" v-if="(submitted || submittedUpdate) && !ruleSelected">User Role is required.</small>
					</div>
					<template #footer>
						<Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
						<Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveData" />
					</template>
				</Dialog>

            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
export default {
    data() {
        return {
            users: null,
            user:{},
            data: {},
            columns: null,
            totalRecords: 0,
            loading:false,
            params: {},
            filters: "",
            deleteDialog:false,
            usersDialog:false,
            submitted:false,
            submittedUpdate:false,
            rulesLevel: null,
            ruleSelected: null,
            eyeHidden: true
        }
    },
    created() {
        this.columns = [
            {field: 'username', header: 'User Name', style: 'min-width:120px;'},
            {field: 'fullname', header: 'Fullname', style: 'min-width:120px;'},
            {field: 'email', header: 'Email', style: 'min-width:120px;'},
            {field: 'role', header: 'Role', style: 'min-width:120px;'},
        ];

        this.rulesLevel = [
            {name: 'Admin', code: 'admin'},
            {name: 'Employee', code: 'employee'},
        ];
    },
    mounted() {
        this.loadData();
    },
    methods: {
        async loadData() {
            const token = localStorage.getItem('token');
            this.loading = true;
            this.params.filters = this.filters;
            const queryParams = Object.keys(this.params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(this.params[k])).join('&');
            const response = await axios.get("users?"+queryParams, {
                headers: {
					"Authorization": `Bearer ${token}`
				}
            })
            .catch(error => {
                this.loading = false;
                const result = error.response.data;
                if(result.meta.code == 401){
                    localStorage.removeItem('token');
                    this.$router.push({name: "login"});
                }else {
                    this.$toast.add({
                        severity:'error',
                        summary: 'Failed!',
                        detail: result.data.errors,
                        life: 3000
                    });
                }
            });

            if(response.data.meta.code == 200){
                const result = response.data;
                this.users = result.data.data;
                this.totalRecords = result.data.countData;
                this.loading = false;
            }
        },
        onPage(event) {
            this.params = event.originalEvent;
            this.params.sortField = event.sortField;
            this.params.sortOrder = event.sortOrder;
            this.loadData();
        },
        onSort(event) {
            // console.log(event)
            this.params.sortField = event.sortField;
            this.params.sortOrder = event.sortOrder;
            this.loadData();
        },
        onFilter() {
            this.loadData();
        },
        refresh() {
            this.loadData();
        },
        newData(){
            this.user = {};
            this.ruleSelected = null;
			this.submitted = false;
            this.usersDialog =true;
        },
        hideDialog() {
			this.usersDialog = false;
			this.submitted = false;
		},
        editData(data) {
			this.user = {...data};
			this.usersDialog = true;
            this.ruleSelected = this.user.role;
		},

        async saveData(){
            const token = localStorage.getItem('token');
            if(!this.user.id){
                this.submitted = true;
                if(
                    this.user.username.trim() && this.ruleSelected,
                    this.user.password && this.user.email.trim(),
                    this.user.fullname
                ){
                    this.user.role = this.ruleSelected;
                    const response = await axios.post("user", this.user, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                    })
                    .catch(error => {
                        this.loading = false;
                        const result = error.response.data;
                        if(result.meta.code == 401){
                            localStorage.removeItem('token');
                            this.$router.push({name: "login"});
                        }else {
                            this.$toast.add({
                                severity:'error',
                                summary: 'Failed!',
                                detail: result.data.errors,
                                life: 3000
                            });
                        }
                    });
                    if(response.data.meta.code == 200){
                        const result = response.data;
                        this.loading = false;
                        this.usersDialog = false;
                        this.loadData();
                        this.$toast.add({
                            severity:'success',
                            summary: result.meta.message,
                            detail: "User Data has been added!",
                            life: 3000
                        });
                    }
                }else{
                    this.usersDialog = false;
                    this.$toast.add({
                        severity:'error',
                        summary: 'Failed!',
                        detail: "Input must be required!",
                        life: 3000
                    });
                }
            }else{
                this.submittedUpdate = true;
                if(
                    this.user.username.trim() && this.ruleSelected,
                    this.user.fullname && this.user.email.trim()
                ){
                    this.user.role = this.ruleSelected;
                    const response = await axios.put("user", this.user, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    })
                    .catch(error => {
                        this.loading = false;
                        const result = error.response.data;
                        if(result.meta.code == 401){
                            localStorage.removeItem('token');
                            this.$router.push({name: "login"});
                        }else {
                            this.$toast.add({
                                severity:'error',
                                summary: 'Failed!',
                                detail: result.data.errors,
                                life: 3000
                            });
                        }
                    });
                    if(response.data.meta.code == 200){
                        const result = response.data;
                        this.loading = false;
                        this.usersDialog = false;
                        this.loadData();
                        this.$toast.add({
                            severity:'success',
                            summary: result.meta.message,
                            detail: "User Data has been updated!",
                            life: 3000
                        });
                    }
                }else{
                    this.usersDialog = false;
                    this.$toast.add({
                        severity:'error',
                        summary: 'Failed!',
                        detail: "Input must be required!",
                        life: 3000
                    });
                }
            }
        },

        confirmDelete(data) {
            this.user = data;
			this.deleteDialog = true;
		},
        async deleteData(){
            if(this.user.id){
                const token = localStorage.getItem('token');
                const response = await axios.delete("user/"+this.user.id, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
                .catch(error => {
                    this.loading = false;
                    const result = error.response.data;
                    if(result.meta.code == 401){
                        localStorage.removeItem('token');
                        this.$router.push({name: "login"});
                    }else {
                        this.$toast.add({
                            severity:'error',
                            summary: 'Failed!',
                            detail: result.data.errors,
                            life: 3000
                        });
                    }
                });
                if(response.data.meta.code == 200){
                    const result = response.data;
                    this.loading = false;
                    this.deleteDialog = false;
                    this.loadData();
                    this.$toast.add({
                        severity:'success',
                        summary: result.meta.message,
                        detail: "User Data has been deleted!",
                        life: 3000
                    });
                }
            }else{
                this.$toast.add({
                    severity:'error',
                    summary: 'Failed!',
                    detail: "Please Reload Apps",
                    life: 3000
                });
            }
        },
    }
}
</script>

<style>
.p-invalid-text {
    color: red;
}
table th, table td{
 /* white-space: nowrap; */
 flex-basis: 1px;
} 
</style>