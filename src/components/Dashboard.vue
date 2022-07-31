<template>
	<Toast />
	<div class="grid">
		<div class="col-12">
			<div class="card">
				<loading
					v-model:active="isLoading"
					:can-cancel="true"
					:on-cancel="onCancel"
					:is-full-page="false"
				/>
				<div class="header">
					<h3>Attendance System</h3>
					<h5 class="date-digital">{{dateDigital}}</h5>
					<span class="time-digital">{{timeDigital}}</span>
				</div>
				<div class="body-content">
					<Button label="IN" class="p-button-rounded p-button-info mr-2 mb-2 btn-attendance" @click="openDialog" style="margin-right: 50px !important;" />
					<Button label="OUT" class="p-button-rounded p-button-danger mr-2 mb-2 btn-attendance" @click="openConfirm" />
				</div>
				<div class="body-footer">
					<div class="field">
						<span class="label-info">Name</span><span class="value-info">: {{user.fullname}}</span><br/>
						<span class="label-info">Email</span><span class="value-info">: {{user.email}}</span><br/>
						<span class="label-info">Role</span><span class="value-info">: {{user.role}}</span><br/>
					</div>
					<div class="field">
						<span class="label-info">Time IN</span><span class="value-info">: {{attendance.time_in}}</span><br/>
						<span class="label-info">Time Out</span><span class="value-info">: {{attendance.time_out}}</span><br/>
						<span class="label-info">Time Duration</span><span class="value-info">: {{attendance.time_duration}}</span><br/>
					</div>
				</div>
			</div>
			<Dialog v-model:visible="attendanceDialog" :style="{width: '500px'}" header="Attendance Verification" :modal="true" class="p-fluid">
				<div class="field">
					<label for="file">Supporting Document</label><br/>
					<div class="file-input">
						<input type="file" id="file" ref="myFiles" class="file" accept=".jpg,.png,.jpeg" @change="imageChange" />
						<label for="file">
							{{ fileInfo ? "Selected File": "Select File" }}
						</label>
						<p class="file-name">
							{{ fileInfo }}
						</p>
					</div>
				</div>
				<template #footer>
					<Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
					<Button label="Save" icon="pi pi-check" class="p-button-text" @click="INAttendance" />
				</template>
			</Dialog>
			<Dialog v-model:visible="attendanceOutDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
				<div class="flex align-items-center justify-content-center">
					<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
					<span v-if="user">Attendance OUT?</span>
				</div>
				<template #footer>
					<Button label="No" icon="pi pi-times" class="p-button-secondary " @click="attendanceOutDialog = false"/>
					<Button label="Yes" icon="pi pi-check" class="p-button-danger" @click="OutAttendance" />
				</template>
			</Dialog>
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
			imageData: null,
			fileInfo: null,
			timeDigital: null,
			dateDigital: null,
			isLoading: false,
			attendanceDialog: false,
			attendanceOutDialog: false,
			attendance: {},
			user: {}
		}
	},
	components: {
        Loading
    },
	created(){
		this.getDateDigital();
		setInterval(this.getTimeDigital, 1000);
	},
	mounted() {
		this.getDetailUser();
		this.getDetailAttendance();
	},
	methods: {
		getTimeDigital(){
			const startingDate = new Date();
			const timeZone = startingDate.getTimezoneOffset();
			const options = {
				hour: '2-digit', minute: '2-digit', second: '2-digit',
				timeZone: timeZone.getTimezoneOffset,
				timeZoneName: 'short'
			}
			const formater = new Intl.DateTimeFormat('sv-SE', options);
			const dateInNewTimezone = formater.format(startingDate);

			this.timeDigital = dateInNewTimezone;
    	},
		getDateDigital(){
			const date = new Date();
			const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
			const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
			this.dateDigital = days[date.getDay()]+", "+date.getDate()+" "+months[date.getMonth()]+" "+date.getFullYear();
		},
		async getDetailUser() {
			const token = localStorage.getItem('token');
			this.isLoading = true;
			const response = await axios.get("user", {
				headers: {
					"Authorization": `Bearer ${token}`
				}
			})
			.catch(error => {
				this.isLoading = false;
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
				this.isLoading = false;
				this.user = result.data;
			}
		},
		async getDetailAttendance() {
			const token = localStorage.getItem('token');
			this.isLoading = true;
			const response = await axios.get("attendance", {
				headers: {
					"Authorization": `Bearer ${token}`
				}
			})
			.catch(error => {
				this.isLoading = false;
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
				this.isLoading = false;
				this.attendance = result.data;
			}
		},
		openDialog(){
			if(this.attendance.id){
				this.$toast.add({
					severity:'error',
					summary: 'Failed!',
					detail: "you have been attendance IN!",
					life: 3000
				});
			}else{
				this.attendanceDialog =true;
			}
        },
        hideDialog() {
			this.attendanceDialog = false;
		},
		openConfirm(){
			if(this.attendance.time_out == "00:00:00"){
				if(this.attendance.id){
					this.attendanceOutDialog = true;
				}else{
					this.$toast.add({
						severity:'error',
						summary: 'Failed!',
						detail: "you must be attendance IN!",
						life: 3000
					});
				}
			}else{
				this.$toast.add({
					severity:'error',
					summary: 'Failed!',
					detail: "you have been attendance today!",
					life: 3000
				});
			}
		},
		imageChange(event) {
            const result = event.target.files[0];
            this.imageData = result;
			const { name: fileName, size } = this.imageData;
			const fileSize = (size / 1000).toFixed(2);
			this.fileInfo = `${fileName} - ${fileSize}KB`;               
        },

		async INAttendance(){
			if(this.imageData == null || this.imageData == undefined || this.imageData == ""){
				this.$toast.add({
					severity:'error',
					summary: 'Failed!',
					detail: "Please Upload Image!",
					life: 3000
				});
			}else{
				const token = localStorage.getItem('token');
				this.isLoading = false;
				const timeData = this.timeDigital.split(" ");
				const formData = new FormData();
				formData.append('time_in', timeData[0]);
				formData.append('file', this.imageData);

				const response = await axios.post("attendance-in", formData,{
					headers: {
					'Content-Type': 'multipart/form-data;',
					"Authorization": `Bearer ${token}`
					}
				})
				.catch(error => {
					this.isLoading = false;
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
					this.$toast.add({
						severity:'success',
						summary: result.meta.message,
						detail: "Successfully Attendance IN!",
						life: 3000
					});
					this.isLoading = false;
					this.imageData = null;
					this.fileInfo = null;
					this.attendanceDialog = false;
					this.getDetailAttendance();
				}
			}
		},
		async OutAttendance() {
			const token = localStorage.getItem('token');
			this.isLoading = true;
			const timeData = this.timeDigital.split(" ");
			var datatosend = {};
			datatosend.id = parseInt(this.attendance.id)
			datatosend.time_out = timeData[0]

			const response = await axios.post("attendance-out", datatosend,{
				headers: {
					"Authorization": `Bearer ${token}`
				}
			})
			.catch(error => {
				this.isLoading = false;
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
				this.$toast.add({
					severity:'success',
					summary: result.meta.message,
					detail: "Successfully Attendance OUT!",
					life: 3000
				});
				this.isLoading = false;
				this.attendanceOutDialog = false;
				this.getDetailAttendance();
			}
		}
	}
}
</script>

<style scoped>
	.header{
		text-align: center;
	}
	.time-digital{
		color: #000;
		font-weight: 600;
		font-size: 24px;
	}
	.body-content{
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 100px;
	}

	.btn-attendance {
		width: 100px !important;
		height: 100px !important;
		border-radius: 50%;
		font-size: 30px;
	}
	.body-footer{
		display: flex;
		justify-content: space-evenly;
		align-items: flex-start;
		margin-top: 50px;
	}

	.label-info, .label-value{
		display: inline-block;
		width: 150px;
		margin-bottom: 5px;
	}
	.file {
		opacity: 0;
		width: 0.1px;
		height: 0.1px;
		position: absolute;
	}

	.file-input label {
		display: block;
		position: relative;
		width: 180px;
		height: 35px;
		border-radius: 20px;
		background-color: rgb(248, 36, 36);
		box-shadow: 0 4px 7px rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		font-weight: bold;
		cursor: pointer;
		transition: transform .2s ease-out;
	}

	.file-name {
		font-size: 0.85rem;
		color: #555;
		margin-bottom: 0;
	}

	input:hover + label,
	input:focus + label {
		transform: scale(1.02);
	}

		/* Adding an outline to the label on focus */
	input:focus + label {
		outline: 1px solid #000;
		outline: -webkit-focus-ring-color auto 2px;
	}


</style>