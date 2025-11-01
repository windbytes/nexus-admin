#!/bin/bash

# TanStack Router 回滚脚本
# 用法: bash scripts/rollback-tanstack-router.sh

set -e

echo "🔙 开始回滚到旧的路由系统..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查备份是否存在
if [ ! -d "src/router-old" ]; then
    echo -e "${RED}❌ 未找到备份文件，无法回滚${NC}"
    exit 1
fi

# 确认操作
read -p "$(echo -e ${YELLOW}确认要回滚到旧的路由系统吗？[y/N] ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ 取消回滚${NC}"
    exit 1
fi

echo ""
echo "📦 步骤 1: 备份新的路由系统..."

# 备份新系统（以防需要再次切换）
if [ -d "src/router" ]; then
    rm -rf src/router-new
    mv src/router src/router-new
    rm -f src/App-new.tsx src/main-new.tsx src/GlobalConfigProvider-new.tsx src/layouts/Content/index-new.tsx
    mv src/App.tsx src/App-new.tsx 2>/dev/null || true
    mv src/main.tsx src/main-new.tsx 2>/dev/null || true
    mv src/GlobalConfigProvider.tsx src/GlobalConfigProvider-new.tsx 2>/dev/null || true
    mv src/layouts/Content/index.tsx src/layouts/Content/index-new.tsx 2>/dev/null || true
fi

echo -e "${GREEN}✅ 备份完成${NC}"
echo ""

echo "🔄 步骤 2: 恢复旧的路由系统..."

# 恢复旧文件
mv src/router-old src/router
mv src/App-old.tsx src/App.tsx
mv src/main-old.tsx src/main.tsx
mv src/GlobalConfigProvider-old.tsx src/GlobalConfigProvider.tsx
mv src/layouts/Content/index-old.tsx src/layouts/Content/index.tsx

echo -e "${GREEN}✅ 旧路由系统已恢复${NC}"
echo ""

echo "📝 步骤 3: 生成回滚报告..."
cat > ROLLBACK_REPORT.txt << EOF
TanStack Router 回滚报告
========================

回滚时间: $(date)

已恢复的文件:
- src/router/
- src/App.tsx
- src/main.tsx
- src/GlobalConfigProvider.tsx
- src/layouts/Content/index.tsx

TanStack Router 文件已保存为:
- src/router-new/
- src/App-new.tsx
- src/main-new.tsx
- src/GlobalConfigProvider-new.tsx
- src/layouts/Content/index-new.tsx

下一步:
1. 运行开发服务器: npm run dev 或 bun dev
2. 验证功能是否正常

如需再次迁移:
bash scripts/migrate-to-tanstack-router.sh

========================
EOF

echo -e "${GREEN}✅ 回滚报告已生成: ROLLBACK_REPORT.txt${NC}"
echo ""

echo "✨ 回滚完成！"
echo ""
echo "📋 下一步操作:"
echo "  1. 启动开发服务器: npm run dev 或 bun dev"
echo "  2. 验证所有功能是否正常"
echo ""

