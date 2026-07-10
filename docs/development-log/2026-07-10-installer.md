# 2026-07-10 安装与分发

## 完成内容

- 实现仅包含 `install`、`update`、`uninstall`、`doctor`、`version` 的 Node.js 安装器；业务工作流命令会以退出码 2 拒绝。
- 支持 Claude Code、Codex、Cursor 的用户/项目 Adapter、TRAE 项目 Adapter，以及通用绝对目录安装。
- 安装记录每个文件的 SHA-256；更新前比较基线与本地内容，拒绝覆盖用户修改、未跟踪文件、符号链接和非普通文件。
- 使用同文件系统 staging、旧目录备份、rename 与逆序回滚；并发写由原子锁目录阻止。
- 卸载仅删除哈希仍匹配的安装器所有文件，保留用户修改和相邻 Skill。
- 添加 Claude Marketplace 与 Codex Plugin 元数据；Skill 公共核心仍只依赖开放 Agent Skills 结构。

## 验证结果

- `node bin/harness-armor.js version --json`：退出码 0，版本字段完整。
- `node bin/harness-armor.js doctor --json`：退出码 0，识别七个 Skill 与 74 个 payload 文件。
- `node bin/harness-armor.js init --json`：退出码 2，确认不存在业务 CLI。
- 自定义临时目录执行 install → installed，已安装脚本 `--help` 退出码 0。
- 同目录执行 update → updated；doctor → healthy；再次 install → current 且 `changed:false`。
- uninstall → uninstalled，安装器记录文件全部移除。
- 发现并修复 Python `__pycache__` 导致的误冲突：入口禁止写 bytecode，doctor/update 忽略已知缓存，卸载清理该缓存。

## 限制与未验证项

- 尚未在 Windows/Linux 实机或真实客户端执行安装；当前为 macOS 临时目录验证。
- npm 注册表尚未发布，`npx harness-armor` 只能在打包/发布后从注册表验证。
- Claude Marketplace Skill 的命名空间调用与独立安装调用不同，README 将明确区分。

## 人工验收步骤

1. 在临时 HOME 对每个 Adapter 执行 `--dry-run --json`，确认解析出的目标目录正确。
2. 安装后修改一个 Skill 文件，再执行 update，确认退出码 1 且文件内容未被覆盖。
3. 执行 uninstall，确认被修改文件保留，其他未修改的安装器所有文件删除。
4. 检查 `installer/cli.js`，确认没有 init/build/promotion/check/prompt 业务命令。
