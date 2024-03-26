import React, { useRef, useEffect, useState } from 'react';

interface Ball {
  x: number;
  y: number;
  radius: number;
  color: string;
  dx: number;
  dy: number;
  id: number;
}

interface CanvasProps {
  width: number;
  height: number;
}

const Canvas: React.FC<CanvasProps> = ({ width, height }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedBallId, setSelectedBallId] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [balls, setBalls] = useState<Ball[]>([
    { id: 1, x: 100, y: 100, radius: 20, color: 'red', dx: 2, dy: 2 },
    { id: 2, x: 200, y: 200, radius: 30, color: 'blue', dx: 3, dy: -3 },
    { id: 3, x: 300, y: 300, radius: 40, color: 'green', dx: -2, dy: -2 },
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
  
    let animationFrameId: number;
  
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      drawBalls(ctx);
      updateBalls();
      animationFrameId = requestAnimationFrame(animate);
    };
  
    animate();
  
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [balls, width, height]);

  const drawBalls = (ctx: CanvasRenderingContext2D) => {
    balls.forEach(ball => {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = ball.color;
      ctx.fill();
      ctx.closePath();
    });
  };

  const updateBalls = () => {
    balls.forEach(ball => {
      ball.x += ball.dx;
      ball.y += ball.dy;

      if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= width) {
        ball.dx *= -1;
      }

      if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= height) {
        ball.dy *= -1;
      }

      balls.forEach(otherBall => {
        if (ball !== otherBall) {
          const dx = otherBall.x - ball.x;
          const dy = otherBall.y - ball.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < ball.radius + otherBall.radius) {
            const unitX = dx / distance;
            const unitY = dy / distance;

            const velocity1 = ball.dx * unitX + ball.dy * unitY;
            const velocity2 = otherBall.dx * unitX + otherBall.dy * unitY;

            const newVelocity1 = (velocity1 * (ball.radius - otherBall.radius) + 2 * otherBall.radius * velocity2) / (ball.radius + otherBall.radius);
            const newVelocity2 = (velocity2 * (otherBall.radius - ball.radius) + 2 * ball.radius * velocity1) / (ball.radius + otherBall.radius);

            ball.dx = newVelocity1 * unitX;
            ball.dy = newVelocity1 * unitY;
            otherBall.dx = newVelocity2 * unitX;
            otherBall.dy = newVelocity2 * unitY;

            const overlap = ball.radius + otherBall.radius - distance;
            ball.x -= overlap * unitX * 0.5;
            ball.y -= overlap * unitY * 0.5;
            otherBall.x += overlap * unitX * 0.5;
            otherBall.y += overlap * unitY * 0.5;
          }
        }
      });
    });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    balls.forEach(ball => {
      const dx = mouseX - ball.x;
      const dy = mouseY - ball.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < ball.radius) {
        // Adjust ball's velocity based on mouse position
        ball.dx = (mouseX - ball.x) * 0.1;
        ball.dy = (mouseY - ball.y) * 0.1;
      }
    });
  };

  const handleBallClick = (id: number) => {
    setMenuOpen(true);
    setSelectedBallId(id);
  };

  const handleColorSelection = (color: string) => {
    if (selectedBallId !== null) {
      setBalls(prevBalls =>
        prevBalls.map(ball =>
          ball.id === selectedBallId ? { ...ball, color } : ball
        )
      );
    }
    setMenuOpen(false);
  };

  const renderMenu = () => {
    if (!menuOpen || selectedBallId === null) return null;

    // Render menu options in the center of the screen
    return (
      <div className="menu" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999 }}>
        <button onClick={() => handleColorSelection('red')}>Red</button>
        <button onClick={() => handleColorSelection('blue')}>Blue</button>
        <button onClick={() => handleColorSelection('green')}>Green</button>
      </div>
    );
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onClick={(e) => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const rect = canvas.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          balls.forEach(ball => {
            const dx = mouseX - ball.x;
            const dy = mouseY - ball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < ball.radius) {
              handleBallClick(ball.id);
            }
          });
        }}
      />
      {renderMenu()}
    </>
  );
};

export default Canvas;
