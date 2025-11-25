#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix duplicate function/export declarations
"""

import re
from pathlib import Path

def fix_duplicate_declarations(file_path):
    """Remove duplicate function/export declarations"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return False
    
    original_content = content
    lines = content.split('\n')
    new_lines = []
    
    i = 0
    seen_declarations = set()
    
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Check for export default declarations (function, withAuth, etc)
        if stripped.startswith('export default'):
            # Extract the full declaration for comparison
            # For "export default function Name" or "export default withAuth(...)"
            declaration_key = stripped
            
            # Normalize: extract key parts for comparison
            if 'function' in stripped:
                match = re.search(r'export default function\s+(\w+)', stripped)
                if match:
                    declaration_key = f'export default function {match.group(1)}'
            elif 'withAuth' in stripped:
                # Extract component name from withAuth(ComponentName, ...)
                match = re.search(r'withAuth\((\w+)', stripped)
                if match:
                    declaration_key = f'export default withAuth({match.group(1)}'
                else:
                    # Use full line as key
                    declaration_key = stripped[:100]  # Limit length
            else:
                # Other export default, use first part
                declaration_key = stripped[:100]
            
            if declaration_key in seen_declarations:
                # This is a duplicate, skip it
                print(f"  Removing duplicate export default at line {i+1}")
                # Skip this line and any following empty lines
                j = i + 1
                while j < len(lines) and not lines[j].strip():
                    j += 1
                i = j
                continue
            else:
                seen_declarations.add(declaration_key)
        
        new_lines.append(line)
        i += 1
    
    new_content = '\n'.join(new_lines)
    
    if new_content != original_content:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        except Exception as e:
            print(f"Error writing {file_path}: {e}")
            return False
    
    return False

def main():
    project_root = Path(__file__).parent
    src_dir = project_root / 'src'
    
    if not src_dir.exists():
        print(f"Source directory not found: {src_dir}")
        return
    
    fixed_count = 0
    total_files = 0
    
    print("Scanning for duplicate declarations...")
    
    for ext in ['*.ts', '*.tsx']:
        for file_path in src_dir.rglob(ext):
            total_files += 1
            if fix_duplicate_declarations(file_path):
                fixed_count += 1
                print(f"Fixed: {file_path.relative_to(project_root)}")
    
    print(f"\nFixed {fixed_count} out of {total_files} files")

if __name__ == '__main__':
    main()

