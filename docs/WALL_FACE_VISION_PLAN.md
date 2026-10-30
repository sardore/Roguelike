
## 결과 (2026-10-30)
방안대로 구현했다. `wallFaceOpen(x,y,dx,dy)`(branches.js) 하나가 면 판단을 맡고, `wallEdges`(북·남·모서리 네 곳), `drawDojoWall`(남쪽·정면 블록의 세로선), `drawWallTexture`, `carryWallEdges`, `drawWallMass.front`가 모두 이를 쓴다. 이전의 복사본 판단은 지웠다.
- 1층 작은 방(55,30): 아래 벽이 통짜 블록이던 것이 얇은 선으로 바뀐다(아래 칸을 보면 블록이 나타난다). 큰 방과 방 안쪽 벽은 그대로.
- 시험 `vision`: 아래 칸을 보기 전/후 `south`가 false→true, 1층 여러 위치에서 안 본 칸 쪽 면·모서리를 요구하는 보이는 벽 0곳.
