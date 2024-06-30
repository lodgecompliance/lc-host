import PropertyList from './Views/List.vue';
import PropertyShow from './Views/Show.vue';
import PropertyReservation from './Views/Reservation.vue';
import PropertySettings from './Views/Settings.vue'
import PropertyNotifications from "@/domain/Property/Views/Notifications.vue";
import ReservationCreate from "@/domain/Reservation/Views/Create.vue";
import ZapierOauth from "@/domain/Property/Views/ZapierOauth.vue";
import multiguard from "vue-router-multiguard";
import middleware from "@/router/middleware";

export default [
    {
        path: '/properties',
        name: 'property.list',
        component: PropertyList,
        meta: {
            requiresAuth: true,
        },
    },
    {
        path: '/oauth/zapier',
        name: 'oauth.zapier',
        component: ZapierOauth,
        beforeEnter: multiguard([middleware.auth])
    },
    {
        path: '/:property/create-reservation',
        name: 'reservation.create',
        component: ReservationCreate,
        meta: {
            requiresAuth: true,
        },
    },
    {
        path: '/:property/settings/:tab?',
        name: 'property.settings',
        component: PropertySettings,
        meta: {
            requiresAuth: true,
        },
    },
    {
        path: '/:property',
        name: 'property.show',
        component: PropertyShow,
    },
    {
        path: '/:property/notifications',
        name: 'property.notifications',
        component: PropertyNotifications,
        meta: {
            requiresAuth: true,
        },
    },
    {
        path: '/:property/reservation/:reservation',
        name: 'property.reservation.show',
        component: PropertyReservation,
        meta: {
            requiresAuth: true,
        },
    }
];