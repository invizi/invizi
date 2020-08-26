<!--
Copyright (C) 2018-2020 AI Atelier Ltd.

This file is part of Invizi.

Invizi is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or (at
your option) any later version.

Invizi is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with Invizi.  If not, see <https://www.gnu.org/licenses/>.
-->
<template>
  <div class="vertical-tabs" style="font-family: 'Open Sans'">
    <div class="vertical-tabs--menu">
      <ul>
        <li v-for="(notification, index) in notifications" :class="{active: selected === notification.id, bold: !read[notification.id]}">
          <a href="" @click="onSelect(notification)">
            <i class="fa fa-circle" title="unread" style="font-size: 0.8rem; margin-right: 7px; color: var(--gray-primary);"  :class="{'invisible':  read[notification.id]}"/>
            {{notification.subject}}
          </a>
        </li>
      </ul>
    </div>
    <div class="vertical-tabs--content">
      <div v-for="(notification, index) in notifications" :class="{active: selected === notification.id}">
        <div class="row">
          <h1 class="col-lg-8">{{notification.subject}}</h1>
          <div class="col-lg-4"><em>{{notification.published_at | dateToHuman}} ({{notification.published_at | fromNow}})</em></div>
        </div>
        <div class="container" style="margin-top: 2rem; white-space: pre-wrap;" v-html="notification.bodyHtml"></div>
      </div>
    </div>
  </div>
</template>

<script>
 import EventBus from '@/components/EventBus'
 import InviziCache from '@/components/InviziCache'
 import Notification from '@/components/Notification'

 export default {
   data () {
     return {
       notifications: [],
       selected: null,
       read: {}
     }
   },
   methods: {
     onSelect (notification) {
       if (!notification.id) return

       this.selected = notification.id
       this.read[notification.id] = true
       InviziCache.setItem('Notifications.read', this.read, {persistent: true})
       EventBus.$emit('Notification/get', this.notifications)
     },
     onGetNotifications (notifications) {
       this.notifications = Notification.toHtml(notifications)
     }
   },
   destroyed () {
     EventBus.$off('Notification/get', this.onGetNotifications)
   },
   mounted () {
     EventBus.$on('Notification/get', this.onGetNotifications)
     this.read = InviziCache.getItem('Notifications.read') || {}
     this.notifications = Notification.toHtml(Notification.last())
     this.onSelect(this.notifications[0])
   }
 }
</script>

<style scoped lang="scss">
 .vertical-tabs {
   display: flex;
   margin-left: -1rem; // to remove gap introduced by .main-content
 }

 .vertical-tabs--menu {
   flex: 1;
   padding-top: 2rem;
   a {
     color: #fff;
     display: inline-block;
     padding: 1rem 1.5rem 1rem 3rem;
     width: 100%;
     text-decoration: none;
     font-size: 1.2rem;
   }

   ul {
     list-style: none;
     min-height: 100vh;
     border-right: 1px solid var(--light-border);

     li.active {
       a, a:hover {
         /* border-right: 5px solid var(--primary); */
         background-image: linear-gradient(to right, #262626 93%, hsla(191, 100%, 65%, 0.67));
         color: var(--primary);
       }
     }
     li a:hover {
       background-color: var(--gray-darker);
       color: var(--white-text-color);
     }
   }
 }

 .vertical-tabs--content {
   flex: 4;
   padding: 3rem 1.5rem 1rem 5rem;
 }

 .vertical-tabs--content .active {
   display: block;

 }

 .vertical-tabs--content > div {
   display: none;
 }

 .vertical-tabs--menu {
   a {
     padding: 0.5rem 1rem;
     border-bottom: 1px solid var(--light-border);
   }
 }

 .vertical-tabs--content {
   flex: 3;
 }
</style>
