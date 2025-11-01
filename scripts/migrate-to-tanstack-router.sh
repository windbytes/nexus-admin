#!/bin/bash

# TanStack Router 迁移脚本
# 用法: bash scripts/migrate-to-tanstack-router.sh

set -e

echo "🚀 开始迁移到 TanStack Router..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 确认操作
read -p "$(echo -e ${YELLOW}确认要迁移到 TanStack Router 吗？这将备份并替换当前的路由系统。[y/N] ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ 取消迁移${NC}"
    exit 1
fi

echo ""
echo "📦 步骤 1: 备份当前文件..."

# 检查是否已经备份
if [ -d "src/router-old" ]; then
    echo -e "${YELLOW}⚠️  检测到已存在备份文件，是否覆盖？[y/N]${NC}"
    read -p "" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ 取消迁移${NC}"
        exit 1
    fi
    rm -rf src/router-old
    rm -f src/App-old.tsx src/main-old.tsx src/GlobalConfigProvider-old.tsx src/layouts/Content/index-old.tsx
fi

# 备份文件
mv src/router src/router-old
mv src/App.tsx src/App-old.tsx
mv src/main.tsx src/main-old.tsx
mv src/GlobalConfigProvider.tsx src/GlobalConfigProvider-old.tsx
mv src/layouts/Content/index.tsx src/layouts/Content/index-old.tsx

echo -e "${GREEN}✅ 备份完成${NC}"
echo ""

echo "🔄 步骤 2: 启用新的路由系统..."

# 启用新文件
mv src/router-new src/router
mv src/App-new.tsx src/App.tsx
mv src/main-new.tsx src/main.tsx
mv src/GlobalConfigProvider-new.tsx src/GlobalConfigProvider.tsx
mv src/layouts/Content/index-new.tsx src/layouts/Content/index.tsx

echo -e "${GREEN}✅ 新路由系统已启用${NC}"
echo ""

echo "🧹 步骤 3: 清理 routes-new 目录..."
if [ -d "src/routes-new" ]; then
    rm -rf src/routes-new
    echo -e "${GREEN}✅ 清理完成${NC}"
else
    echo -e "${YELLOW}⚠️  routes-new 目录不存在，跳过${NC}"
fi
echo ""

echo "📝 步骤 4: 生成迁移报告..."
cat > MIGRATION_REPORT.txt << EOF
TanStack Router 迁移报告
========================

迁移时间: $(date)

已备份的文件:
- src/router-old/
- src/App-old.tsx
- src/main-old.tsx
- src/GlobalConfigProvider-old.tsx
- src/layouts/Content/index-old.tsx

新启用的文件:
- src/router/
- src/App.tsx
- src/main.tsx
- src/GlobalConfigProvider.tsx
- src/layouts/Content/index.tsx

下一步:
1. 运行开发服务器: npm run dev 或 bun dev
2. 测试所有功能
3. 查看 MIGRATION_TANSTACK_ROUTER.md 了解详细信息
4. 如果一切正常，可以删除备份文件

回滚命令:
bash scripts/rollback-tanstack-router.sh

========================
EOF

echo -e "${GREEN}✅ 迁移报告已生成: MIGRATION_REPORT.txt${NC}"
echo ""

echo "✨ 迁移完成！"
echo ""
echo "📋 下一步操作:"
echo "  1. 启动开发服务器: npm run dev 或 bun dev"
echo "  2. 测试所有功能是否正常"
echo "  3. 查看 MIGRATION_TANSTACK_ROUTER.md 了解详细信息"
echo ""
echo "⚠️  如果遇到问题，运行以下命令回滚:"
echo "  bash scripts/rollback-tanstack-router.sh"
echo ""

