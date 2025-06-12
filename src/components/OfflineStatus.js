import React from 'react';

export default function OfflineStatus({ isOffline }) {
  return (
    <div style={{ padding: 12, background: isOffline ? '#ffcdd2' : '#c8e6c9', color: '#222', textAlign: 'center' }}>
      {isOffline ? 'ขณะนี้คุณอยู่ในโหมดออฟไลน์ (Offline Mode)' : 'เชื่อมต่อกับระบบเรียบร้อย'}
    </div>
  );
} 