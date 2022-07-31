<template>
    <div class="grid">
        <Toast/>
        
        <div class="col-12">
            <router-view @refreshTable="refresh"></router-view>
        </div>
        <div class="col-12">
			<div class="card">
                <h5>Attendance Report</h5>
                <DataTable 
                    :lazy="true" 
                    :paginator="true" 
                    :scrollable="true"
                    scrollHeight="flex"
                    :wrapper="true"
                    :rows="10"
                    :value="attendances" 
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
                    <Column header="Image" headerStyle="min-width:10rem;">
						<template #body="slotProps">
							<span class="p-column-title">Image</span>
							<img :src="slotProps.data.file" :alt="slotProps.data.file" class="shadow-2" width="100" />
						</template>
					</Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<script>
// import {FilterMatchMode} from 'primevue/api';
import axios from 'axios';
export default {
    data() {
        return {
            attendances: null,
            attendance:{},
            columns: null,
            totalRecords: 0,
            loading:false,
            params: {},
            filters: ""
        }
    },
    created() {
        this.columns = [
            {field: 'username', header: 'Username', style: 'min-width:120px;'},
            {field: 'fullname', header: 'Fullname', style: 'min-width:120px;'},
            {field: 'email', header: 'Email', style: 'min-width:120px;'},
            {field: 'role', header: 'Role', style: 'min-width:120px;'},
            {field: 'time_in', header: 'Time IN', style: 'min-width:120px;'},
            {field: 'time_out', header: 'Time OUT', style: 'min-width:120px;'},
            {field: 'time_duration', header: 'Time Duration', style: 'min-width:120px;'},
            {field: 'date_attendance', header: 'Date Attendance', style: 'min-width:120px;'},
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
            const response = await axios.get("attendances?"+queryParams,{
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
                this.attendances = result.data.data;
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