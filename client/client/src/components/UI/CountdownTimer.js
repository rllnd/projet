import React, { useState, useEffect } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';

const CountdownTimer = ({ endDate }) => {
  const calculateTimeLeft = () => {
    const difference = new Date(endDate) - new Date();
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      return null;
    }
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!timeLeft) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', color: '#ff4d4f', fontWeight: 'bold' }}>
        <ClockCircleOutlined style={{ marginRight: '5px' }} />
        <span>Temps écoulé</span>
      </div>
    );
  }

  const isCritical = timeLeft.minutes < 1 && timeLeft.hours === 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        color: isCritical ? '#ff4d4f' : '#1c2b4a',
        fontWeight: 'bold',
      }}
    >
      <ClockCircleOutlined style={{ marginRight: '5px' }} />
      <span>
        {timeLeft.days > 0 && `${timeLeft.days}j `}
        {timeLeft.hours > 0 && `${timeLeft.hours}h `}
        {timeLeft.minutes > 0 && `${timeLeft.minutes}m `}
        {timeLeft.seconds}s
      </span>
    </div>
  );
};

export default CountdownTimer;
