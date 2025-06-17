import cv2
import numpy as np
import base64
import json
import sys
from sklearn.cluster import KMeans
import easyocr

def convert_numpy_types(obj):
    """Convert numpy types to Python native types for JSON serialization"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    return obj

def image_to_base64(image):
    """Convert OpenCV image to base64 string"""
    _, buffer = cv2.imencode('.png', image)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/png;base64,{img_base64}"

def extract_name_from_input(image_path, x=142, y=24, w=439, h=50):
    """Extract name from input field"""
    try:
        # Check if easyocr is available
        if easyocr is None:
            return {"error": "EasyOCR nu este instalat. Rulează: pip install easyocr"}
        
        img = cv2.imread(image_path)
        if img is None:
            return {"error": "Nu s-a putut încărca imaginea"}
        
        x, y, w, h = int(x), int(y), int(w), int(h)
        
        img_height, img_width = img.shape[:2]
        if x + w > img_width or y + h > img_height:
            w = min(w, img_width - x)
            h = min(h, img_height - y)
        
        name_roi = img[y:y+h, x:x+w]
        
        if name_roi.size == 0:
            return {"error": "ROI gol pentru numele"}
        
        gray_roi = cv2.cvtColor(name_roi, cv2.COLOR_BGR2GRAY)
        
        # Enhance the image for better OCR
        scale_factor = 3
        enlarged = cv2.resize(gray_roi, None, fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_CUBIC)
        
        # Apply CLAHE for better contrast
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        enhanced = clahe.apply(enlarged)
        
        # Denoise
        denoised = cv2.fastNlMeansDenoising(enhanced)
        
        # Threshold
        _, binary = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        if np.mean(binary) > 127:
            binary = cv2.bitwise_not(binary)
        
        # Clean up
        kernel = np.ones((2,2), np.uint8)
        cleaned = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
        
        # OCR
        reader = easyocr.Reader(['ro', 'en'], gpu=False)
        results = reader.readtext(cleaned)
        
        detected_names = []
        all_text = ""
        confidences = []
        
        for (bbox, text, confidence) in results:
            if confidence > 0.2 and len(text.strip()) > 1:  # Lowered confidence threshold
                clean_text = text.strip()
                # Filter out non-alphabetic characters for names
                if any(c.isalpha() for c in clean_text):
                    detected_names.append({
                        "text": clean_text,
                        "confidence": float(confidence)
                    })
                    all_text += " " + clean_text
                    confidences.append(confidence)
        
        final_name = all_text.strip()
        avg_confidence = float(np.mean(confidences)) if confidences else 0.0
        
        # Validation
        if final_name:
            if not any(c.isalpha() for c in final_name):
                final_name = ""
                avg_confidence = 0.0
        
        # Debug info
        debug_info = {
            "roi_shape": name_roi.shape,
            "roi_mean": float(np.mean(gray_roi)),
            "enhanced_mean": float(np.mean(enhanced)),
            "binary_mean": float(np.mean(binary)),
            "detected_count": len(results),
            "raw_results": [(text, float(conf)) for (_, text, conf) in results]
        }
        
        return {
            "name": final_name,
            "confidence": avg_confidence,
            "detected_elements": detected_names,
            "roi_coordinates": {"x": int(x), "y": int(y), "width": int(w), "height": int(h)},
            "success": bool(final_name),
            "debug": debug_info
        }
        
    except ImportError:
        return {"error": "EasyOCR nu este instalat. Rulează: pip install easyocr"}
    except Exception as e:
        return {"error": f"Eroare la extragerea numelui: {str(e)}", "details": str(type(e).__name__)}

def detect_checked_boxes(image_path, start_y=75):
    """Detect checked boxes in image starting from y coordinate"""
    try:
        img = cv2.imread(image_path)
        if img is None:
            return []
        
        # Crop image to start from start_y to exclude name area
        img_cropped = img[start_y:, :]
        
        gray = cv2.cvtColor(img_cropped, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (3, 3), 0)
        
        adaptive_thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2)
        _, binary_thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        combined_thresh = cv2.bitwise_or(adaptive_thresh, binary_thresh)
        
        kernel = np.ones((2, 2), np.uint8)
        cleaned = cv2.morphologyEx(combined_thresh, cv2.MORPH_CLOSE, kernel)
        cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, kernel)
        
        contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        boxes = []
        potential_boxes = []
        
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            area = cv2.contourArea(contour)
            
            if (15 < w < 150 and 15 < h < 150 and area > 200):
                aspect_ratio = w / h
                if 0.5 < aspect_ratio < 2.0:
                    hull = cv2.convexHull(contour)
                    hull_area = cv2.contourArea(hull)
                    if hull_area > 0:
                        solidity = area / hull_area
                        if solidity > 0.7:
                            # Add start_y offset to get correct coordinates in original image
                            potential_boxes.append((x, y + start_y, w, h, area))
        
        if len(potential_boxes) > 5:
            try:
                dimensions = np.array([[box[2], box[3]] for box in potential_boxes])
                n_clusters = min(3, len(potential_boxes))
                if len(np.unique(dimensions, axis=0)) >= n_clusters:
                    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
                    clusters = kmeans.fit_predict(dimensions)
                    unique, counts = np.unique(clusters, return_counts=True)
                    main_cluster = unique[np.argmax(counts)]
                    
                    for i, (x, y, w, h, area) in enumerate(potential_boxes):
                        if clusters[i] == main_cluster:
                            boxes.append((x, y, w, h))
                else:
                    boxes = [(x, y, w, h) for x, y, w, h, area in potential_boxes]
            except Exception:
                boxes = [(x, y, w, h) for x, y, w, h, area in potential_boxes]
        else:
            boxes = [(x, y, w, h) for x, y, w, h, area in potential_boxes]
        
        boxes.sort(key=lambda box: (box[1] // 30, box[0]))
        
        checked_boxes = []
        
        for i, (x, y, w, h) in enumerate(boxes):
            # Adjust coordinates back to cropped image for ROI extraction
            y_cropped = y - start_y
            
            margin1 = max(2, min(w, h) // 8)
            margin2 = max(4, min(w, h) // 6)
            
            roi1 = cleaned[y_cropped+margin1:y_cropped+h-margin1, x+margin1:x+w-margin1]
            roi2 = cleaned[y_cropped+margin2:y_cropped+h-margin2, x+margin2:x+w-margin2]
            
            if roi1.size == 0 or roi2.size == 0:
                checked_boxes.append(0)
                continue
            
            white_pixels1 = cv2.countNonZero(roi1)
            total_pixels1 = roi1.shape[0] * roi1.shape[1]
            density1 = white_pixels1 / total_pixels1 if total_pixels1 > 0 else 0
            
            white_pixels2 = cv2.countNonZero(roi2)
            total_pixels2 = roi2.shape[0] * roi2.shape[1]
            density2 = white_pixels2 / total_pixels2 if total_pixels2 > 0 else 0
            
            edges = cv2.Canny(roi1, 50, 150)
            edge_pixels = cv2.countNonZero(edges)
            edge_density = edge_pixels / total_pixels1 if total_pixels1 > 0 else 0
            
            template_x = np.zeros((min(20, h-2*margin1), min(20, w-2*margin1)), dtype=np.uint8)
            if template_x.shape[0] > 5 and template_x.shape[1] > 5:
                cv2.line(template_x, (2, 2), (template_x.shape[1]-3, template_x.shape[0]-3), 255, 2)
                cv2.line(template_x, (template_x.shape[1]-3, 2), (2, template_x.shape[0]-3), 255, 2)
                
                if roi1.shape[0] > 0 and roi1.shape[1] > 0:
                    roi_resized = cv2.resize(roi1, (template_x.shape[1], template_x.shape[0]))
                    result = cv2.matchTemplate(roi_resized, template_x, cv2.TM_CCOEFF_NORMED)
                    _, max_val, _, _ = cv2.minMaxLoc(result)
                    template_match = max_val
                else:
                    template_match = 0
            else:
                template_match = 0
            
            roi_contours, _ = cv2.findContours(roi1, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            significant_contours = 0
            for contour in roi_contours:
                if cv2.contourArea(contour) > 10:
                    significant_contours += 1
            
            is_checked = False
            
            if (density1 > 0.15 or density2 > 0.20):
                is_checked = True
            elif edge_density > 0.05:
                is_checked = True
            elif template_match > 0.3:
                is_checked = True
            elif significant_contours >= 2:
                is_checked = True
            
            if is_checked:
                if density1 < 0.05 and edge_density < 0.02:
                    is_checked = False
            
            checked_boxes.append(1 if is_checked else 0)
        
        return checked_boxes
        
    except Exception as e:
        return []

def create_matrix(answers, questions_per_row=5):
    """Convert flat list to matrix"""
    while len(answers) % questions_per_row != 0:
        answers.append(0)
    
    matrix = np.array(answers).reshape(-1, questions_per_row)
    return matrix

def calculate_score(barem_matrix, elev_matrix):
    """Calculate score"""
    if barem_matrix.shape != elev_matrix.shape:
        return 0, 0, 0, []
    
    total_questions = barem_matrix.shape[0]
    correct_answers = 0
    details = []
    
    for i in range(total_questions):
        barem_row = barem_matrix[i]
        elev_row = elev_matrix[i]
        
        is_correct = np.array_equal(barem_row, elev_row)
        
        if is_correct:
            correct_answers += 1
            details.append({
                "question": int(i+1), 
                "status": "CORRECT", 
                "barem": [int(x) for x in barem_row.tolist()], 
                "elev": [int(x) for x in elev_row.tolist()]
            })
        else:
            details.append({
                "question": int(i+1), 
                "status": "WRONG", 
                "barem": [int(x) for x in barem_row.tolist()], 
                "elev": [int(x) for x in elev_row.tolist()]
            })
    
    score_percentage = (correct_answers / total_questions) * 100
    return score_percentage, correct_answers, total_questions, details

def create_result_image(elev_path, barem_matrix, elev_matrix, questions_per_row=5, start_y=75):
    """Create result image with colored boxes"""
    try:
        elev_img = cv2.imread(elev_path)
        if elev_img is None:
            return None
        
        result_img = elev_img.copy()
        
        # Crop image to start from start_y
        img_cropped = elev_img[start_y:, :]
        
        gray = cv2.cvtColor(img_cropped, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY_INV)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        boxes = []
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            if w > 20 and h > 20 and w < 100 and h < 100:
                aspect_ratio = w / h
                if 0.7 < aspect_ratio < 1.3:
                    # Add start_y offset to get correct coordinates in original image
                    boxes.append((x, y + start_y, w, h))
        
        boxes.sort(key=lambda box: (box[1], box[0]))
        
        total_questions = min(barem_matrix.shape[0], elev_matrix.shape[0])
        
        for question_idx in range(total_questions):
            barem_row = barem_matrix[question_idx]
            elev_row = elev_matrix[question_idx]
            
            is_correct = np.array_equal(barem_row, elev_row)
            color = (0, 255, 0) if is_correct else (0, 0, 255)  # Green/Red
            
            start_box = question_idx * questions_per_row
            end_box = start_box + questions_per_row
            
            for box_idx in range(start_box, min(end_box, len(boxes))):
                if box_idx < len(boxes):
                    x, y, w, h = boxes[box_idx]
                    cv2.rectangle(result_img, (x-2, y-2), (x+w+2, y+h+2), color, 3)
                    
                    if box_idx == start_box:
                        cv2.putText(result_img, f"Q{question_idx+1}", 
                                  (x-30, y+h//2), cv2.FONT_HERSHEY_SIMPLEX, 
                                  0.6, color, 2)
        
        return image_to_base64(result_img)
        
    except Exception as e:
        return None

def compare_grids_api(barem_path, elev_path, questions_per_row=5, extract_name=True):
    """Main function for API - returns JSON results"""
    results = {}
    
    # Extract name
    if extract_name:
        name_result = extract_name_from_input(elev_path)
        results['student_name'] = name_result
    
    # Process images
    barem_answers = detect_checked_boxes(barem_path)
    elev_answers = detect_checked_boxes(elev_path)
    
    if not barem_answers or not elev_answers:
        return {"error": "Could not detect answers in one or both images"}
    
    # Create matrices and calculate score
    barem_matrix = create_matrix(barem_answers, questions_per_row)
    elev_matrix = create_matrix(elev_answers, questions_per_row)
    
    score, correct, total, details = calculate_score(barem_matrix, elev_matrix)
    
    # Create result image
    result_image_base64 = create_result_image(elev_path, barem_matrix, elev_matrix, questions_per_row)
    
    # Convert all results to JSON-serializable types
    results.update({
        #'score_percentage': float(round(score, 1)),
        'correct_answers': int(correct),
        'total_questions': int(total),
        #'grade_out_of_10': float(round(score/10, 1)),
        'details': details,
        'result_image': result_image_base64,
        'barem_matrix': convert_numpy_types(barem_matrix.tolist()),
        'elev_matrix': convert_numpy_types(elev_matrix.tolist())
    })
    
    return convert_numpy_types(results)

if __name__ == "__main__":
    # Read arguments from command line
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Usage: python verificareGrila.py <barem_path> <elev_path>"}))
        sys.exit(1)
    
    barem_path = sys.argv[1]
    elev_path = sys.argv[2]
    
    # Process and return JSON
    results = compare_grids_api(barem_path, elev_path)
    print(json.dumps(results, ensure_ascii=False, indent=2))