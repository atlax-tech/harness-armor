# 2026-07-10 项目基础与确定性证据引擎

## 完成内容

- 建立 Harness Armor 自身的短入口 `AGENTS.md`、产品/架构/设计/开发/测试/验收文档和 `.harness` 状态文件。
- 建立唯一版本化 Harness Engineering v1 规范、JSON Schema、模板和健康度维度。
- 实现八个 Python 标准库辅助脚本：仓库状态识别、扫描、来源指纹、Manifest 校验、结构校验、断链检查、漂移检测和健康度评分。
- 所有扫描脚本默认只读，限制文件数量/单文件大小/总字节数，忽略敏感文件、依赖、缓存、构建产物和符号链接。

## 验证结果

- `python3 -m compileall -q shared/scripts`：通过。
- `python3 shared/scripts/detect_repository_state.py --help`：退出码 0，帮助信息完整。
- `python3 shared/scripts/scan_repository.py --hash --max-files 20000 .`：退出码 0，输出稳定 JSON，无截断。
- `python3 shared/scripts/validate_manifest.py .`：退出码 0，Manifest 有效。
- `python3 shared/scripts/fingerprint_sources.py . docs/PRODUCT.md docs/ARCHITECTURE.md docs/ACCEPTANCE.md`：退出码 0，三个来源均生成 SHA-256。

## 限制与未验证项

- 当前仅在 macOS 本机执行；Windows 与 Linux 需要后续 CI 实际运行后才能宣称通过。
- 尚未实现七个 Skill、安装器和完整测试矩阵。

## 人工验收步骤

1. 阅读 `shared/spec/harness-engineering-v1.md`，确认事实分类、授权门、文件所有权和 Prompt 角色分离规则。
2. 在任意只读仓库运行 `python3 shared/scripts/scan_repository.py <repo>`，确认执行前后文件哈希不变。
3. 在包含 `.env` 和外部符号链接的临时仓库运行扫描，确认结果只报告跳过原因且不泄露内容。
