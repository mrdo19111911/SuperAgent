# C3: IP & Licensing

**Focus:** Are there legal/licensing risks?

## Checklist

- [ ] **OSS License Audit:** Are dependencies using permissive licenses (MIT, Apache)?
- [ ] **Copyleft Risk:** Any GPL/AGPL libraries that require open-sourcing?
- [ ] **Core IP Protection:** Is proprietary logic protected (not in public repos)?
- [ ] **License Compliance:** Are license requirements met (attribution, notices)?

## Red Flags

- GPL/AGPL libraries in commercial product (viral license)
- Proprietary algorithms in public GitHub repo
- Missing license attributions (violates terms)

## Examples

**RISKY:** Using GPL library `xyz` → requires open-sourcing entire codebase
**SAFE:** All dependencies use MIT/Apache licenses, core IP in private repo
