import os
import sys
import json

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from database.db import db
from model.workout.preset_program_model import PresetProgramModel

def seed_presets():
    with app.app_context():
        print("🌱 Đang đọc dữ liệu từ presets_data.json...")
        with open('presets_data.json', 'r', encoding='utf-8') as f:
            presets = json.load(f)
            
        print(f"📦 Tìm thấy {len(presets)} lộ trình. Bắt đầu đẩy vào DB...")
        
        # Xóa hết data cũ để tránh trùng lặp nếu chạy lại
        db.session.query(PresetProgramModel).delete()
        
        for p in presets:
            new_preset = PresetProgramModel(
                id=p['id'],
                title=p['title'],
                goal=p.get('goal'),
                difficulty=p.get('difficulty'),
                duration_days=p.get('duration_days', 7),
                calories_per_day=p.get('calories_per_day'),
                image=p.get('image'),
                description=p.get('description'),
                suitable_time=p.get('suitable_time'),
                focus_areas=p.get('focus_areas', []),
                daily_avg_duration=p.get('daily_avg_duration'),
                preview_schedule=p.get('preview_schedule', [])
            )
            db.session.add(new_preset)
            
        db.session.commit()
        print("✅ Hoàn tất lưu dữ liệu Preset Programs vào Database!")

if __name__ == '__main__':
    seed_presets()
