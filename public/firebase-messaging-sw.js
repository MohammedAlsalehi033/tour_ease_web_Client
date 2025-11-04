// public/firebase-messaging-sw.js

// Make sure you import the compat libraries
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

// --- IMPORTANT: HARDCODE YOUR CONFIGURATION HERE ---
const firebaseConfig = {
  apiKey: "AIzaSyCaULeM38NXUkrvfJzH0SqVMFTRKjzvTkM",
  authDomain: "tourease-544c3.firebaseapp.com",
  databaseURL: "https://tourease-544c3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tourease-544c3",
  storageBucket: "tourease-544c3.firebasestorage.app",
  messagingSenderId: "442077525561",
  appId: "1:442077525561:web:e4beb77af00fa45a16bfe8",
  measurementId: "G-6TS100MM1D"
};

// Initialize the Firebase app in the service worker
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background notifications.
const messaging = firebase.messaging();

// Optional: If you want to handle background notifications here
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// This helps activate the new service worker faster
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});