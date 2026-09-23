import React from 'react';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

type Shape =
  | { type: 'path'; d: string; fill?: 'none' | 'currentColor' }
  | { type: 'circle'; cx: number; cy: number; r: number }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number }
  | { type: 'rect'; x: number; y: number; width: number; height: number; rx?: number }
  | { type: 'polyline'; points: string };

const ICONS = {
  'arrow-left': [{ type: 'path', d: 'M19 12H5M12 19l-7-7 7-7' }],
  phone: [
    {
      type: 'path',
      d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z',
    },
  ],
  lock: [
    { type: 'rect', x: 3, y: 11, width: 18, height: 11, rx: 2 },
    { type: 'path', d: 'M7 11V7a5 5 0 0 1 10 0v4' },
  ],
  eye: [
    { type: 'path', d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' },
    { type: 'circle', cx: 12, cy: 12, r: 3 },
  ],
  'eye-off': [
    {
      type: 'path',
      d: 'M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.8 21.8 0 0 1 5.06-6.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-3.22 4.55',
    },
    { type: 'line', x1: 1, y1: 1, x2: 23, y2: 23 },
  ],
  mail: [
    { type: 'rect', x: 2, y: 4, width: 20, height: 16, rx: 2 },
    { type: 'path', d: 'M22 6l-10 7L2 6' },
  ],
  user: [
    { type: 'path', d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' },
    { type: 'circle', cx: 12, cy: 7, r: 4 },
  ],
  'user-plus': [
    { type: 'path', d: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' },
    { type: 'circle', cx: 8.5, cy: 7, r: 4 },
    { type: 'line', x1: 19, y1: 8, x2: 19, y2: 14 },
    { type: 'line', x1: 22, y1: 11, x2: 16, y2: 11 },
  ],
  check: [{ type: 'polyline', points: '20 6 9 17 4 12' }],
  'check-circle': [
    { type: 'path', d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' },
    { type: 'polyline', points: '22 4 12 14.01 9 11.01' },
  ],
  'x-circle': [
    { type: 'circle', cx: 12, cy: 12, r: 10 },
    { type: 'line', x1: 15, y1: 9, x2: 9, y2: 15 },
    { type: 'line', x1: 9, y1: 9, x2: 15, y2: 15 },
  ],
  'alert-circle': [
    { type: 'circle', cx: 12, cy: 12, r: 10 },
    { type: 'line', x1: 12, y1: 8, x2: 12, y2: 12 },
    { type: 'line', x1: 12, y1: 16, x2: 12.01, y2: 16 },
  ],
  'alert-triangle': [
    {
      type: 'path',
      d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
    },
    { type: 'line', x1: 12, y1: 9, x2: 12, y2: 13 },
    { type: 'line', x1: 12, y1: 17, x2: 12.01, y2: 17 },
  ],
  info: [
    { type: 'circle', cx: 12, cy: 12, r: 10 },
    { type: 'line', x1: 12, y1: 16, x2: 12, y2: 12 },
    { type: 'line', x1: 12, y1: 8, x2: 12.01, y2: 8 },
  ],
  clock: [
    { type: 'circle', cx: 12, cy: 12, r: 10 },
    { type: 'polyline', points: '12 6 12 12 16 14' },
  ],
  'refresh-cw': [
    { type: 'polyline', points: '23 4 23 10 17 10' },
    { type: 'polyline', points: '1 20 1 14 7 14' },
    {
      type: 'path',
      d: 'M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
    },
  ],
  'chevron-down': [{ type: 'polyline', points: '6 9 12 15 18 9' }],
  'chevron-right': [{ type: 'polyline', points: '9 18 15 12 9 6' }],
  settings: [
    { type: 'circle', cx: 12, cy: 12, r: 3 },
    {
      type: 'path',
      d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
    },
  ],
  'wifi-off': [
    { type: 'line', x1: 1, y1: 1, x2: 23, y2: 23 },
    { type: 'path', d: 'M16.72 11.06A10.94 10.94 0 0 1 19 12.55' },
    { type: 'path', d: 'M5 12.55a10.94 10.94 0 0 1 5.17-2.39' },
    { type: 'path', d: 'M10.71 5.05A16 16 0 0 1 22.58 9' },
    { type: 'path', d: 'M1.42 9a15.91 15.91 0 0 1 4.7-2.88' },
    { type: 'path', d: 'M8.53 16.11a6 6 0 0 1 6.95 0' },
    { type: 'line', x1: 12, y1: 20, x2: 12.01, y2: 20 },
  ],
  'shopping-cart': [
    { type: 'circle', cx: 9, cy: 21, r: 1 },
    { type: 'circle', cx: 20, cy: 21, r: 1 },
    {
      type: 'path',
      d: 'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6',
    },
  ],
  share: [
    { type: 'circle', cx: 18, cy: 5, r: 3 },
    { type: 'circle', cx: 6, cy: 12, r: 3 },
    { type: 'circle', cx: 18, cy: 19, r: 3 },
    { type: 'line', x1: 8.59, y1: 13.51, x2: 15.42, y2: 17.49 },
    { type: 'line', x1: 15.41, y1: 6.51, x2: 8.59, y2: 10.49 },
  ],
  percent: [
    { type: 'line', x1: 19, y1: 5, x2: 5, y2: 19 },
    { type: 'circle', cx: 6.5, cy: 6.5, r: 2.5 },
    { type: 'circle', cx: 17.5, cy: 17.5, r: 2.5 },
  ],
  x: [
    { type: 'line', x1: 18, y1: 6, x2: 6, y2: 18 },
    { type: 'line', x1: 6, y1: 6, x2: 18, y2: 18 },
  ],
  sun: [
    { type: 'circle', cx: 12, cy: 12, r: 5 },
    { type: 'line', x1: 12, y1: 1, x2: 12, y2: 3 },
    { type: 'line', x1: 12, y1: 21, x2: 12, y2: 23 },
    { type: 'line', x1: 4.22, y1: 4.22, x2: 5.64, y2: 5.64 },
    { type: 'line', x1: 18.36, y1: 18.36, x2: 19.78, y2: 19.78 },
    { type: 'line', x1: 1, y1: 12, x2: 3, y2: 12 },
    { type: 'line', x1: 21, y1: 12, x2: 23, y2: 12 },
    { type: 'line', x1: 4.22, y1: 19.78, x2: 5.64, y2: 18.36 },
    { type: 'line', x1: 18.36, y1: 5.64, x2: 19.78, y2: 4.22 },
  ],
  moon: [{ type: 'path', d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' }],
  'pause-circle': [
    { type: 'circle', cx: 12, cy: 12, r: 10 },
    { type: 'line', x1: 10, y1: 9, x2: 10, y2: 15 },
    { type: 'line', x1: 14, y1: 9, x2: 14, y2: 15 },
  ],
  flag: [
    { type: 'path', d: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z' },
    { type: 'line', x1: 4, y1: 22, x2: 4, y2: 15 },
  ],
  globe: [
    { type: 'circle', cx: 12, cy: 12, r: 10 },
    { type: 'line', x1: 2, y1: 12, x2: 22, y2: 12 },
    { type: 'path', d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' },
  ],
  sliders: [
    { type: 'line', x1: 4, y1: 21, x2: 4, y2: 14 },
    { type: 'line', x1: 4, y1: 10, x2: 4, y2: 3 },
    { type: 'line', x1: 12, y1: 21, x2: 12, y2: 12 },
    { type: 'line', x1: 12, y1: 8, x2: 12, y2: 3 },
    { type: 'line', x1: 20, y1: 21, x2: 20, y2: 16 },
    { type: 'line', x1: 20, y1: 12, x2: 20, y2: 3 },
    { type: 'line', x1: 1, y1: 14, x2: 7, y2: 14 },
    { type: 'line', x1: 9, y1: 8, x2: 15, y2: 8 },
    { type: 'line', x1: 17, y1: 16, x2: 23, y2: 16 },
  ],
  bell: [
    { type: 'path', d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' },
    { type: 'path', d: 'M13.73 21a2 2 0 0 1-3.46 0' },
  ],
  edit: [
    { type: 'path', d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' },
    { type: 'path', d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z' },
  ],
  trash: [
    { type: 'polyline', points: '3 6 5 6 21 6' },
    { type: 'path', d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' },
  ],
  package: [
    { type: 'path', d: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
    { type: 'polyline', points: '3.27 6.96 12 12.01 20.73 6.96' },
    { type: 'line', x1: 12, y1: 22.08, x2: 12, y2: 12 },
  ],
  home: [
    { type: 'path', d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { type: 'path', d: 'M9 22V12h6v10' },
  ],
  plus: [
    { type: 'line', x1: 12, y1: 5, x2: 12, y2: 19 },
    { type: 'line', x1: 5, y1: 12, x2: 19, y2: 12 },
  ],
  upload: [
    { type: 'path', d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' },
    { type: 'polyline', points: '17 8 12 3 7 8' },
    { type: 'line', x1: 12, y1: 3, x2: 12, y2: 15 },
  ],
  camera: [
    {
      type: 'path',
      d: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z',
    },
    { type: 'circle', cx: 12, cy: 13, r: 4 },
  ],
  image: [
    { type: 'rect', x: 3, y: 3, width: 18, height: 18, rx: 2 },
    { type: 'circle', cx: 8.5, cy: 8.5, r: 1.5 },
    { type: 'path', d: 'M21 15l-5-5L5 21' },
  ],
  'file-text': [
    { type: 'path', d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
    { type: 'polyline', points: '14 2 14 8 20 8' },
    { type: 'line', x1: 16, y1: 13, x2: 8, y2: 13 },
    { type: 'line', x1: 16, y1: 17, x2: 8, y2: 17 },
  ],
  pin: [
    { type: 'path', d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' },
    { type: 'circle', cx: 12, cy: 10, r: 3 },
  ],
  search: [
    { type: 'circle', cx: 11, cy: 11, r: 8 },
    { type: 'line', x1: 21, y1: 21, x2: 16.65, y2: 16.65 },
  ],
  crosshair: [
    { type: 'circle', cx: 12, cy: 12, r: 3 },
    { type: 'line', x1: 12, y1: 2, x2: 12, y2: 6 },
    { type: 'line', x1: 12, y1: 18, x2: 12, y2: 22 },
    { type: 'line', x1: 2, y1: 12, x2: 6, y2: 12 },
    { type: 'line', x1: 18, y1: 12, x2: 22, y2: 12 },
  ],
  building: [
    { type: 'rect', x: 4, y: 2, width: 16, height: 20, rx: 1 },
    { type: 'line', x1: 8, y1: 6, x2: 8, y2: 6.01 },
    { type: 'line', x1: 12, y1: 6, x2: 12, y2: 6.01 },
    { type: 'line', x1: 16, y1: 6, x2: 16, y2: 6.01 },
    { type: 'line', x1: 8, y1: 10, x2: 8, y2: 10.01 },
    { type: 'line', x1: 12, y1: 10, x2: 12, y2: 10.01 },
    { type: 'line', x1: 16, y1: 10, x2: 16, y2: 10.01 },
    { type: 'line', x1: 9, y1: 22, x2: 9, y2: 18 },
    { type: 'line', x1: 15, y1: 22, x2: 15, y2: 18 },
  ],
  users: [
    { type: 'path', d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' },
    { type: 'circle', cx: 9, cy: 7, r: 4 },
    { type: 'path', d: 'M23 21v-2a4 4 0 0 0-3-3.87' },
    { type: 'path', d: 'M16 3.13a4 4 0 0 1 0 7.75' },
  ],
  grid: [
    { type: 'rect', x: 3, y: 3, width: 7, height: 7, rx: 1 },
    { type: 'rect', x: 14, y: 3, width: 7, height: 7, rx: 1 },
    { type: 'rect', x: 14, y: 14, width: 7, height: 7, rx: 1 },
    { type: 'rect', x: 3, y: 14, width: 7, height: 7, rx: 1 },
  ],
  hash: [
    { type: 'line', x1: 4, y1: 9, x2: 20, y2: 9 },
    { type: 'line', x1: 4, y1: 15, x2: 20, y2: 15 },
    { type: 'line', x1: 10, y1: 3, x2: 8, y2: 21 },
    { type: 'line', x1: 16, y1: 3, x2: 14, y2: 21 },
  ],
  landmark: [
    { type: 'line', x1: 3, y1: 22, x2: 21, y2: 22 },
    { type: 'line', x1: 6, y1: 18, x2: 6, y2: 11 },
    { type: 'line', x1: 10, y1: 18, x2: 10, y2: 11 },
    { type: 'line', x1: 14, y1: 18, x2: 14, y2: 11 },
    { type: 'line', x1: 18, y1: 18, x2: 18, y2: 11 },
    { type: 'line', x1: 3, y1: 8, x2: 21, y2: 8 },
    { type: 'path', d: 'M12 2l9 6H3z' },
  ],
  briefcase: [
    { type: 'rect', x: 2, y: 7, width: 20, height: 14, rx: 2 },
    { type: 'path', d: 'M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' },
  ],
  calendar: [
    { type: 'rect', x: 3, y: 4, width: 18, height: 18, rx: 2 },
    { type: 'line', x1: 16, y1: 2, x2: 16, y2: 6 },
    { type: 'line', x1: 8, y1: 2, x2: 8, y2: 6 },
    { type: 'line', x1: 3, y1: 10, x2: 21, y2: 10 },
  ],
  'shield-check': [
    { type: 'path', d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { type: 'polyline', points: '9 12 11 14 15 10' },
  ],
  'credit-card': [
    { type: 'rect', x: 1, y: 4, width: 22, height: 16, rx: 2 },
    { type: 'line', x1: 1, y1: 10, x2: 23, y2: 10 },
  ],
  copy: [
    { type: 'rect', x: 9, y: 9, width: 13, height: 13, rx: 2 },
    { type: 'path', d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' },
  ],
  award: [
    { type: 'circle', cx: 12, cy: 8, r: 6 },
    { type: 'path', d: 'M8.5 13.5L7 22l5-3 5 3-1.5-8.5' },
  ],
  'trending-up': [
    { type: 'polyline', points: '23 6 13.5 15.5 8.5 10.5 1 18' },
    { type: 'polyline', points: '17 6 23 6 23 12' },
  ],
  truck: [
    { type: 'rect', x: 1, y: 3, width: 15, height: 13, rx: 1 },
    { type: 'path', d: 'M16 8h4l3 3v5h-7V8z' },
    { type: 'circle', cx: 5.5, cy: 18.5, r: 2.5 },
    { type: 'circle', cx: 18.5, cy: 18.5, r: 2.5 },
  ],
  'arrow-right': [{ type: 'path', d: 'M5 12h14M12 5l7 7-7 7' }],
  'message-otp': [
    {
      type: 'path',
      d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    },
    { type: 'circle', cx: 9, cy: 10, r: 1 },
    { type: 'circle', cx: 12, cy: 10, r: 1 },
    { type: 'circle', cx: 15, cy: 10, r: 1 },
  ],
  minus: [{ type: 'line', x1: 5, y1: 12, x2: 19, y2: 12 }],
  tag: [
    {
      type: 'path',
      d: 'M20.59 13.41L11 3.83A2 2 0 0 0 9.59 3.24H4a1 1 0 0 0-1 1v5.59a2 2 0 0 0 .59 1.41l9.58 9.59a2 2 0 0 0 2.82 0l4.6-4.6a2 2 0 0 0 0-2.82z',
    },
    { type: 'circle', cx: 7.5, cy: 7.5, r: 1.5 },
  ],
  layers: [
    { type: 'polyline', points: '12 2 2 7 12 12 22 7 12 2' },
    { type: 'polyline', points: '2 17 12 22 22 17' },
    { type: 'polyline', points: '2 12 12 17 22 12' },
  ],
  barcode: [
    { type: 'line', x1: 3, y1: 4, x2: 3, y2: 20 },
    { type: 'line', x1: 7, y1: 4, x2: 7, y2: 20 },
    { type: 'line', x1: 11, y1: 4, x2: 11, y2: 20 },
    { type: 'line', x1: 14, y1: 4, x2: 14, y2: 20 },
    { type: 'line', x1: 18, y1: 4, x2: 18, y2: 20 },
    { type: 'line', x1: 21, y1: 4, x2: 21, y2: 20 },
  ],
  sort: [
    { type: 'line', x1: 6, y1: 20, x2: 6, y2: 4 },
    { type: 'polyline', points: '2 8 6 4 10 8' },
    { type: 'line', x1: 18, y1: 4, x2: 18, y2: 20 },
    { type: 'polyline', points: '22 16 18 20 14 16' },
  ],
  'more-vertical': [
    { type: 'circle', cx: 12, cy: 5, r: 1.5 },
    { type: 'circle', cx: 12, cy: 12, r: 1.5 },
    { type: 'circle', cx: 12, cy: 19, r: 1.5 },
  ],
  star: [
    {
      type: 'path',
      d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    },
  ],
  repeat: [
    { type: 'path', d: 'M17 1l4 4-4 4' },
    { type: 'path', d: 'M3 11V9a4 4 0 0 1 4-4h14' },
    { type: 'path', d: 'M7 23l-4-4 4-4' },
    { type: 'path', d: 'M21 13v2a4 4 0 0 1-4 4H3' },
  ],
  bike: [
    { type: 'circle', cx: 5.5, cy: 17.5, r: 3.5 },
    { type: 'circle', cx: 18.5, cy: 17.5, r: 3.5 },
    { type: 'path', d: 'M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z' },
    { type: 'path', d: 'M12 17.5V14l-3-3 4-3 2 3h3' },
  ],
  download: [
    { type: 'path', d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' },
    { type: 'polyline', points: '7 10 12 15 17 10' },
    { type: 'line', x1: 12, y1: 15, x2: 12, y2: 3 },
  ],
  smartphone: [
    { type: 'rect', x: 5, y: 2, width: 14, height: 20, rx: 2 },
    { type: 'line', x1: 12, y1: 18, x2: 12.01, y2: 18 },
  ],
  'log-out': [
    { type: 'path', d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' },
    { type: 'polyline', points: '16 17 21 12 16 7' },
    { type: 'line', x1: 21, y1: 12, x2: 9, y2: 12 },
  ],
} as const satisfies Record<string, Shape[]>;

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 24, color = '#1F2937', strokeWidth = 2 }: Props) {
  const shapes = ICONS[name];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {shapes.map((shape, index) => {
        const key = `${name}-${index}`;
        switch (shape.type) {
          case 'path':
            return (
              <Path
                key={key}
                d={shape.d}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            );
          case 'circle':
            return (
              <Circle
                key={key}
                cx={shape.cx}
                cy={shape.cy}
                r={shape.r}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="none"
              />
            );
          case 'line':
            return (
              <Line
                key={key}
                x1={shape.x1}
                y1={shape.y1}
                x2={shape.x2}
                y2={shape.y2}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
            );
          case 'rect':
            return (
              <Rect
                key={key}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                rx={shape.rx}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="none"
              />
            );
          case 'polyline':
            return (
              <Polyline
                key={key}
                points={shape.points}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            );
          default:
            return null;
        }
      })}
    </Svg>
  );
}
