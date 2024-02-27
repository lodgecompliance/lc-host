import middleware from '../../router/middleware';
import multiguard from 'vue-router-multiguard';

import User from './Views/User';
import Users from './Views/Users';
import Property from './Views/Property';
import Properties from './Views/Properties';
import Reservation from './Views/Reservation';
import Reservations from './Views/Reservations';
import Payments from "./Views/Payments";
import Verifications from "./Views/Verifications";
import Notifications from "./Views/Notifications";
import SystemConfig from "./Views/SystemConfig";

export default [
    {
        path: '/dashboard/reservations',
        name: 'dashboard.reservations',
        component: Reservations,
        meta: {
            requiresAuth: true,
        },
    },
    {
        path: '/dashboard/reservation/:id',
        name: 'dashboard.reservation.show',
        component: Reservation,
        meta: {
            requiresAuth: true,
        },
    },
    {
        path: '/dashboard/properties',
        name: 'dashboard.properties',
        component: Properties,
        meta: {
            requiresAuth: true,
        },
    },
    {
        path: '/dashboard/property/:id',
        name: 'dashboard.property.show',
        component: Property,
        meta: {
            requiresAuth: true,
        },
    },
    {
        path: '/dashboard/users',
        name: 'dashboard.users',
        component: Users,
        meta: {
            requiresAuth: true,
        },
    },
    {
        path: '/dashboard/user/:id',
        name: 'dashboard.user.show',
        component: User,
        meta: {
            requiresAuth: true,
        },
    },
    {
        path: '/dashboard/payments',
        name: 'dashboard.payments',
        component: Payments,
        meta: {
            requiresAuth: true,
        },
    },
    {
        path: '/dashboard/verifications',
        name: 'dashboard.verifications',
        component: Verifications,
        meta: {
            requiresAuth: true,
        },
    },
    {
        path: '/dashboard/notifications',
        name: 'dashboard.notifications',
        component: Notifications,
        meta: {
            requiresAuth: true,
        },
    },
    {
        path: '/dashboard/system',
        name: 'dashboard.system.config',
        component: SystemConfig,
        meta: {
            requiresAuth: true,
        },
    },

];