---
title: "Verilog考试速成"
course: EELC400105
type: notes
author: 戚剑飞
updated: 2026-06-23
order: 6
---
# Verilog 考试速成：从数字电路到可写代码

> 目标：只为应付“数字电路与数字逻辑”期末中的 Verilog/HDL 编程题。重点不是工程项目，而是能把组合逻辑、触发器、计数器、状态机这些题目稳定翻译成 Verilog。

## 0. 这份笔记的考试边界

结合现有复习课笔记，本课程重点是：

| 章节            | 考试权重 | Verilog 中对应内容                                    |
| ------------- | ---: | ------------------------------------------------ |
| 第 1 章 数字逻辑基础  |   辅助 | 逻辑表达式、卡诺图、最小项、与/或/非、异或                           |
| 第 2 章 组合逻辑电路  |   重点 | `assign`、`always @(*)`、加法器、译码器、编码器、MUX、比较器、险象冗余项 |
| 第 3 章 时序逻辑电路  |  最重点 | `always @(posedge clk)`、触发器、计数器、寄存器、FSM          |
| 第 4 章 可编程逻辑器件 | 概念为主 | Verilog 与 PLD/FPGA/CPLD、RTL、综合                   |

考试通常不会要求你写复杂工程代码。能熟练写下面这些，就够用了：

1. 模块 `module ... endmodule`
2. 组合逻辑 `assign` 和 `always @(*)`
3. 时序逻辑 `always @(posedge clk)` 和非阻塞赋值 `<=`
4. `if / else`、`case`
5. 半加器、全加器、MUX、译码器、编码器、比较器
6. D 触发器、JK/T 触发器行为、计数器
7. 简单 FSM：状态编码、现态、次态、输出
8. 简单 testbench：产生时钟、给输入、看输出

---

## 1. Verilog 到底在描述什么

Verilog 是 HDL，Hardware Description Language，硬件描述语言。它不是普通编程语言。

最重要的一句话：

> Verilog 代码描述的是“电路结构或电路行为”，不是 CPU 一行一行执行的软件流程。

例如：

```verilog
assign y = (a & b) | c;
assign z = ~y;
```

这不是“先算 y 再算 z”的程序，而是两组硬件同时存在：

- 第一组门电路一直根据 `a,b,c` 产生 `y`
- 第二组反相器一直根据 `y` 产生 `z`

所以看到 Verilog 时，要习惯在脑子里问：

> 这段代码最后会变成什么电路？

---

## 2. 最基本结构：module

一个 Verilog 文件通常由一个或多个模块组成。模块就像电路图里的一个方框，有输入、输出和内部逻辑。

```verilog
module and_gate (
    input  a,
    input  b,
    output y
);
    assign y = a & b;
endmodule
```

对应电路：

```text
a ----\
       AND ---- y
b ----/
```

### 2.1 端口方向

| 关键字 | 含义 | 类比 |
|---|---|---|
| `input` | 输入端口 | 电路的输入引脚 |
| `output` | 输出端口 | 电路的输出引脚 |
| `inout` | 双向端口 | 总线、三态端口，考试一般少用 |

### 2.2 位宽

```verilog
input  [3:0] a;   // 4 位输入，a[3] 是最高位，a[0] 是最低位
output [7:0] y;   // 8 位输出
```

常见写法：

```verilog
module adder4 (
    input  [3:0] a,
    input  [3:0] b,
    input        cin,
    output [3:0] sum,
    output       cout
);
    assign {cout, sum} = a + b + cin;
endmodule
```

`{cout, sum}` 是拼接，表示把 1 位 `cout` 和 4 位 `sum` 拼成 5 位结果。

---

## 3. 数值写法和常用运算符

### 3.1 数值常量

格式：

```text
位宽'进制数值
```

例子：

```verilog
1'b0       // 1 位二进制 0
4'b1010    // 4 位二进制 1010
8'h3F      // 8 位十六进制 3F
4'd10      // 4 位十进制 10，也就是 1010
```

| 进制 | 写法 | 例子 |
|---|---|---|
| 二进制 | `'b` | `4'b0101` |
| 十进制 | `'d` | `8'd15` |
| 十六进制 | `'h` | `8'h0F` |

### 3.2 四种逻辑值

Verilog 里一个 bit 可以是：

| 值 | 含义 |
|---|---|
| `0` | 低电平 / 逻辑 0 |
| `1` | 高电平 / 逻辑 1 |
| `x` | 未知值 |
| `z` | 高阻态 |

考试中常见：

```verilog
assign bus = en ? data : 1'bz;
```

含义：使能 `en=1` 时驱动总线，否则输出高阻态。

### 3.3 运算符

| 运算   | Verilog             | 数字逻辑含义     |     |
| ---- | ------------------- | ---------- | --- |
| 非    | `~a`                | NOT        |     |
| 与    | `a & b`             | AND        |     |
| 或    | `a                  | b`         | OR  |
| 异或   | `a ^ b`             | XOR        |     |
| 同或   | `a ~^ b` 或 `a ^~ b` | XNOR       |     |
| 条件选择 | `sel ? a : b`       | 2 选 1 MUX  |     |
| 拼接   | `{a,b}`             | 拼成更宽的总线    |     |
| 重复拼接 | `{4{a}}`            | 把 a 重复 4 次 |     |

注意区分：

| 类型   | 符号     |           | 含义<br>               |     |
| ---- | ------ | --------- | -------------------- | --- |
| 按位逻辑 | `&`、`  | `、`~`     | 每一位分别运算，常用于电路        |     |
| 条件逻辑 | `&&`、` | `、`!`<br> | 判断真假，常用于 `if` 条件<br> |     |

考试写电路时，通常优先用按位逻辑。

---

## 4. wire、reg、assign、always 的关系

### 4.1 `wire`

`wire` 表示连线。它本身不保存状态，必须被某个逻辑持续驱动。

```verilog
wire n1;
assign n1 = a & b;
```

### 4.2 `reg`

`reg` 是 Verilog 语法里的变量类型，表示它可以在 `always` 块里被赋值。

重点：

> `reg` 这个词不一定真的综合成寄存器。是否变成寄存器，要看 `always` 块是不是时钟触发。

例如组合逻辑中也可能写：

```verilog
output reg y;

always @(*) begin
    y = a & b;
end
```

这里 `y` 不一定是触发器，只是因为它在 `always` 块里赋值，所以语法上要写成 `reg`。

### 4.3 `assign`

`assign` 是连续赋值，适合简单组合逻辑。

```verilog
assign y = (a & b) | (~a & c);
```

可以理解为：右边电路一直驱动左边信号。

### 4.4 `always`

`always` 是过程块，可以描述组合逻辑，也可以描述时序逻辑。

组合逻辑：

```verilog
always @(*) begin
    y = a & b;
end
```

时序逻辑：

```verilog
always @(posedge clk) begin
    q <= d;
end
```

---

## 5. 组合逻辑：两种标准写法

组合逻辑特点：

> 输出只由当前输入决定，没有记忆功能。

对应课程第 2 章。

### 5.1 用 `assign` 写组合逻辑

适合逻辑表达式直接给出的题。

例：实现 `F = A·B + A'·C`

```verilog
module logic_func (
    input  A,
    input  B,
    input  C,
    output F
);
    assign F = (A & B) | (~A & C);
endmodule
```

对应电路：

```text
F = A B + A' C

A ----&----\
B ----/     \
             OR ---- F
~A ---&-----/
C ----/
```

### 5.2 用 `always @(*)` 写组合逻辑

适合 `if / else`、`case`、MUX、译码器、优先编码器。

```verilog
module mux2 (
    input  a,
    input  b,
    input  sel,
    output reg y
);
    always @(*) begin
        if (sel)
            y = b;
        else
            y = a;
    end
endmodule
```

这就是一个 2 选 1 多路选择器：

```text
sel=0 -> y=a
sel=1 -> y=b
```

### 5.3 组合逻辑三条铁律

1. 用 `always @(*)`，不要漏敏感信号。
2. 在组合逻辑里用阻塞赋值 `=`。
3. 每个输出在所有分支都要被赋值，否则可能推断出锁存器 latch。

错误写法：

```verilog
always @(*) begin
    if (sel)
        y = a;
    // sel=0 时 y 没有赋值，可能生成 latch
end
```

正确写法 1：

```verilog
always @(*) begin
    if (sel)
        y = a;
    else
        y = b;
end
```

正确写法 2：先给默认值。

```verilog
always @(*) begin
    y = b;
    if (sel)
        y = a;
end
```

---

## 6. 例题 1：半加器和全加器

### 6.1 半加器

半加器不考虑低位进位。

| A | B | S | CO |
|---|---|---|---|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 1 |

表达式：

```text
S  = A xor B
CO = A B
```

Verilog：

```verilog
module half_adder (
    input  A,
    input  B,
    output S,
    output CO
);
    assign S  = A ^ B;
    assign CO = A & B;
endmodule
```

### 6.2 全加器

全加器考虑低位进位 `CI`。

表达式：

```text
S  = A xor B xor CI
CO = A B + A CI + B CI
```

Verilog：

```verilog
module full_adder (
    input  A,
    input  B,
    input  CI,
    output S,
    output CO
);
    assign S  = A ^ B ^ CI;
    assign CO = (A & B) | (A & CI) | (B & CI);
endmodule
```

也可以直接写成加法：

```verilog
assign {CO, S} = A + B + CI;
```

考试中如果题目强调从门电路/真值表推导，写逻辑表达式更稳；如果只是写功能，实现加法写法也可以。

### 6.3 4 位行波加法器

用全加器级联：

```verilog
module ripple_adder4 (
    input  [3:0] A,
    input  [3:0] B,
    input        CI,
    output [3:0] S,
    output       CO
);
    wire c1, c2, c3;

    full_adder fa0 (.A(A[0]), .B(B[0]), .CI(CI), .S(S[0]), .CO(c1));
    full_adder fa1 (.A(A[1]), .B(B[1]), .CI(c1), .S(S[1]), .CO(c2));
    full_adder fa2 (.A(A[2]), .B(B[2]), .CI(c2), .S(S[2]), .CO(c3));
    full_adder fa3 (.A(A[3]), .B(B[3]), .CI(c3), .S(S[3]), .CO(CO));
endmodule
```

这个例子体现了 Verilog 的层次化设计：小模块可以实例化成大模块。

---

## 7. 例题 2：MUX 多路选择器

### 7.1 2 选 1 MUX

逻辑表达式：

```text
Y = S' A + S B
```

写法 1：

```verilog
assign Y = (~S & A) | (S & B);
```

写法 2：

```verilog
assign Y = S ? B : A;
```

写法 3：

```verilog
always @(*) begin
    if (S)
        Y = B;
    else
        Y = A;
end
```

### 7.2 4 选 1 MUX

```verilog
module mux4 (
    input        d0,
    input        d1,
    input        d2,
    input        d3,
    input  [1:0] sel,
    output reg   y
);
    always @(*) begin
        case (sel)
            2'b00: y = d0;
            2'b01: y = d1;
            2'b10: y = d2;
            2'b11: y = d3;
            default: y = 1'b0;
        endcase
    end
endmodule
```

`case` 常用于译码器、MUX、状态机。考试中写 `default` 是好习惯。

### 7.3 用 MUX 实现任意组合逻辑

课程里讲过：多路选择器是通用逻辑模块。

例：`F(A,B,C)=Σm(0,2,5,7)`，用 8 选 1 MUX：

```text
选择信号：S2S1S0 = ABC
D0=1, D2=1, D5=1, D7=1
其他 Di=0
```

Verilog 可以写：

```verilog
module func_by_mux (
    input  A,
    input  B,
    input  C,
    output F
);
    wire [2:0] sel = {A, B, C};
    reg y;

    always @(*) begin
        case (sel)
            3'd0, 3'd2, 3'd5, 3'd7: y = 1'b1;
            default: y = 1'b0;
        endcase
    end

    assign F = y;
endmodule
```

---

## 8. 例题 3：译码器和编码器

### 8.1 2-4 译码器

二进制译码器输出最小项。

```verilog
module decoder2to4 (
    input  [1:0] a,
    input        en,
    output reg [3:0] y
);
    always @(*) begin
        if (!en) begin
            y = 4'b0000;
        end else begin
            case (a)
                2'b00: y = 4'b0001;
                2'b01: y = 4'b0010;
                2'b10: y = 4'b0100;
                2'b11: y = 4'b1000;
                default: y = 4'b0000;
            endcase
        end
    end
endmodule
```

如果题目给的是低有效输出，类似 74LS138，要把输出反过来：

```verilog
2'b00: y = 4'b1110;
2'b01: y = 4'b1101;
2'b10: y = 4'b1011;
2'b11: y = 4'b0111;
```

考试要注意“高有效 / 低有效”。

### 8.2 8-3 优先编码器

优先编码器：多个输入同时有效时，只响应优先级最高的输入。

下面假设 `in[7]` 优先级最高，高有效。

```verilog
module priority_encoder8 (
    input  [7:0] in,
    output reg [2:0] code,
    output reg       valid
);
    always @(*) begin
        valid = 1'b1;
        casez (in)
            8'b1???????: code = 3'd7;
            8'b01??????: code = 3'd6;
            8'b001?????: code = 3'd5;
            8'b0001????: code = 3'd4;
            8'b00001???: code = 3'd3;
            8'b000001??: code = 3'd2;
            8'b0000001?: code = 3'd1;
            8'b00000001: code = 3'd0;
            default: begin
                code  = 3'd0;
                valid = 1'b0;
            end
        endcase
    end
endmodule
```

`casez` 中的 `?` 表示不关心位，适合优先编码器。

---

## 9. 例题 4：比较器

### 9.1 一位相等比较

```text
EQ = A xnor B = ~(A xor B)
```

```verilog
assign eq = ~(a ^ b);
```

### 9.2 2 位比较器

比较两个 2 位无符号数 `x` 和 `y`：

```verilog
module cmp2 (
    input  [1:0] x,
    input  [1:0] y,
    output       gt,
    output       lt,
    output       eq
);
    assign gt = (x > y);
    assign lt = (x < y);
    assign eq = (x == y);
endmodule
```

如果题目要求按逻辑表达式写：

```text
eq = (x1 xnor y1) · (x0 xnor y0)
gt = x1 y1' + (x1 xnor y1) x0 y0'
lt = x1' y1 + (x1 xnor y1) x0' y0
```

Verilog：

```verilog
wire high_eq = ~(x[1] ^ y[1]);

assign eq = high_eq & ~(x[0] ^ y[0]);
assign gt = (x[1] & ~y[1]) | (high_eq & x[0] & ~y[0]);
assign lt = (~x[1] & y[1]) | (high_eq & ~x[0] & y[0]);
```

---

## 10. 竞争与险象在 Verilog 中怎么考

课程第 2 章强调竞争与险象。Verilog 考试中可能不会让你模拟真实门延迟，但可能让你：

1. 判断表达式是否存在险象
2. 加冗余项消除险象
3. 写出消除险象后的 Verilog

例：

```text
F = A B + A' C
```

当 `B=C=1` 时：

```text
F = A + A' = 1
```

理论上输出应保持 1。但因为 `A` 和 `A'` 经过不同路径，可能出现短暂 0 脉冲，即静态 1 险象。

增加冗余项：

```text
F = A B + A' C + B C
```

Verilog：

```verilog
assign F = (A & B) | (~A & C) | (B & C);
```

考试记法：

| 逻辑形式 | 可能险象 | 消除方式 |
|---|---|---|
| 与或式、与非-与非 | 静态 1 险象 | 增加冗余与项 |
| 或与式、或非-或非 | 静态 0 险象 | 增加冗余或因子 |

---

## 11. 时序逻辑：触发器和寄存器

时序逻辑特点：

> 输出不仅和当前输入有关，还和过去状态有关。

对应课程第 3 章。

### 11.1 D 触发器

D 触发器最常用于 Verilog，因为：

```text
Q_next = D
```

写法：

```verilog
module dff (
    input  clk,
    input  d,
    output reg q
);
    always @(posedge clk) begin
        q <= d;
    end
endmodule
```

这会综合成上升沿触发 D 触发器。

### 11.2 带同步复位的 D 触发器

同步复位：只有时钟上升沿到来时，复位才生效。

```verilog
module dff_sync_rst (
    input  clk,
    input  rst,
    input  d,
    output reg q
);
    always @(posedge clk) begin
        if (rst)
            q <= 1'b0;
        else
            q <= d;
    end
endmodule
```

### 11.3 带异步复位的 D 触发器

异步复位：复位信号一有效，不等时钟。

```verilog
module dff_async_rst (
    input  clk,
    input  rst,
    input  d,
    output reg q
);
    always @(posedge clk or posedge rst) begin
        if (rst)
            q <= 1'b0;
        else
            q <= d;
    end
endmodule
```

低有效异步复位常写：

```verilog
always @(posedge clk or negedge rst_n) begin
    if (!rst_n)
        q <= 1'b0;
    else
        q <= d;
end
```

### 11.4 时序逻辑三条铁律

1. 用边沿触发：`always @(posedge clk)` 或 `always @(posedge clk or negedge rst_n)`
2. 用非阻塞赋值 `<=`
3. 多个寄存器在同一个时钟沿“同时更新”

不要这样：

```verilog
always @(posedge clk) begin
    q = d;    // 不推荐
end
```

推荐：

```verilog
always @(posedge clk) begin
    q <= d;
end
```

---

## 12. `=` 和 `<=` 的核心区别

这是 Verilog 最常考、最容易错的点。

### 12.1 阻塞赋值 `=`

在同一个 `always` 块里，立即更新，后面的语句看到新值。

```verilog
always @(*) begin
    a = b;
    c = a;
end
```

结果：`c` 得到的是新的 `a`，也就是 `b`。

适合：组合逻辑。

### 12.2 非阻塞赋值 `<=`

右边先统一取旧值，左边到时间步末尾统一更新。

```verilog
always @(posedge clk) begin
    a <= b;
    c <= a;
end
```

一个时钟沿后：

- `a` 得到旧的 `b`
- `c` 得到旧的 `a`

这正好符合多个触发器同时采样、同时更新。

适合：时序逻辑。

### 12.3 考试口诀

```text
组合 always 用 =
时序 always 用 <=
assign 不用 = 或 <=，它自己就是连续赋值
不要在同一个 always 块混用 = 和 <=
不要在多个 always 块里给同一个 reg 赋值
```

---

## 13. JK 触发器和 T 触发器

课程里会考 JK/T 的特性方程。Verilog 中通常可以直接写行为。

### 13.1 JK 触发器

功能表：

| J | K | Q_next |
|---|---|---|
| 0 | 0 | Q |
| 0 | 1 | 0 |
| 1 | 0 | 1 |
| 1 | 1 | ~Q |

Verilog：

```verilog
module jk_ff (
    input  clk,
    input  rst,
    input  j,
    input  k,
    output reg q
);
    always @(posedge clk) begin
        if (rst)
            q <= 1'b0;
        else begin
            case ({j, k})
                2'b00: q <= q;
                2'b01: q <= 1'b0;
                2'b10: q <= 1'b1;
                2'b11: q <= ~q;
            endcase
        end
    end
endmodule
```

也可以根据特性方程写：

```text
Q_next = J Q' + K' Q
```

```verilog
wire q_next = (j & ~q) | (~k & q);

always @(posedge clk) begin
    q <= q_next;
end
```

### 13.2 T 触发器

功能：

```text
T=0 -> 保持
T=1 -> 翻转
Q_next = T xor Q
```

```verilog
module t_ff (
    input  clk,
    input  rst,
    input  t,
    output reg q
);
    always @(posedge clk) begin
        if (rst)
            q <= 1'b0;
        else if (t)
            q <= ~q;
        else
            q <= q;
    end
endmodule
```

---

## 14. 计数器

### 14.1 4 位同步加 1 计数器

```verilog
module counter4 (
    input        clk,
    input        rst,
    input        en,
    output reg [3:0] q
);
    always @(posedge clk) begin
        if (rst)
            q <= 4'd0;
        else if (en)
            q <= q + 4'd1;
        else
            q <= q;
    end
endmodule
```

对应电路含义：

- `q` 是 4 个 D 触发器
- `q + 1` 是组合加法逻辑
- 每个时钟沿把新值打入触发器

### 14.2 模 m 计数器

例：模 10 计数器，状态 0 到 9，之后回 0。

```verilog
module counter_mod10 (
    input        clk,
    input        rst,
    output reg [3:0] q
);
    always @(posedge clk) begin
        if (rst)
            q <= 4'd0;
        else if (q == 4'd9)
            q <= 4'd0;
        else
            q <= q + 4'd1;
    end
endmodule
```

这对应课程里的“跳跃”思想：从最后一个有效状态跳回初态。

### 14.3 升降计数器

```verilog
module up_down_counter (
    input        clk,
    input        rst,
    input        up,
    output reg [3:0] q
);
    always @(posedge clk) begin
        if (rst)
            q <= 4'd0;
        else if (up)
            q <= q + 4'd1;
        else
            q <= q - 4'd1;
    end
endmodule
```

---

## 15. 寄存器和移位寄存器

### 15.1 并行寄存器

```verilog
module reg8 (
    input        clk,
    input        rst,
    input        load,
    input  [7:0] d,
    output reg [7:0] q
);
    always @(posedge clk) begin
        if (rst)
            q <= 8'd0;
        else if (load)
            q <= d;
    end
endmodule
```

没有 `else q <= q;` 也可以，因为时序逻辑在未赋值分支会保持原寄存器值。为了考试清晰，可以写上。

### 15.2 左移寄存器

```verilog
module shift_left4 (
    input        clk,
    input        rst,
    input        sin,
    output reg [3:0] q
);
    always @(posedge clk) begin
        if (rst)
            q <= 4'b0000;
        else
            q <= {q[2:0], sin};
    end
endmodule
```

`{q[2:0], sin}` 表示：

```text
q[3] <- q[2]
q[2] <- q[1]
q[1] <- q[0]
q[0] <- sin
```

---

## 16. FSM 有限状态机

FSM 是时序电路设计题和 Verilog 编程题最可能结合的地方。

### 16.1 Moore 和 Mealy

| 类型 | 输出依赖 | 特点 |
|---|---|---|
| Moore | 只和当前状态有关 | 输出更稳定 |
| Mealy | 和当前状态、当前输入都有关 | 状态可能少，响应更快 |

课程里的说法：

```text
Moore: Z(t) = F[Y(t)]
Mealy: Z(t) = F[X(t), Y(t)]
```

### 16.2 FSM 标准三段式写法

1. 状态寄存器：现态 `state` 在时钟沿更新
2. 次态逻辑：根据现态和输入得到 `next_state`
3. 输出逻辑：根据状态或状态+输入得到输出

### 16.3 例题：检测序列 101，Mealy 型

输入 `x` 串行进入；当最近三位是 `101` 时，输出 `z=1` 一个周期。

状态定义：

| 状态 | 含义 |
|---|---|
| S0 | 什么都没匹配 |
| S1 | 已看到 `1` |
| S2 | 已看到 `10` |

状态转移：

```text
S0 --x=1--> S1
S0 --x=0--> S0

S1 --x=0--> S2
S1 --x=1--> S1

S2 --x=1/z=1--> S1
S2 --x=0/z=0--> S0
```

Verilog：

```verilog
module seq101_mealy (
    input  clk,
    input  rst,
    input  x,
    output reg z
);
    parameter S0 = 2'b00;
    parameter S1 = 2'b01;
    parameter S2 = 2'b10;

    reg [1:0] state, next_state;

    // 1. 状态寄存器
    always @(posedge clk) begin
        if (rst)
            state <= S0;
        else
            state <= next_state;
    end

    // 2. 次态逻辑
    always @(*) begin
        case (state)
            S0: begin
                if (x) next_state = S1;
                else   next_state = S0;
            end
            S1: begin
                if (x) next_state = S1;
                else   next_state = S2;
            end
            S2: begin
                if (x) next_state = S1;
                else   next_state = S0;
            end
            default: next_state = S0;
        endcase
    end

    // 3. 输出逻辑：Mealy 输出和 state、x 都有关
    always @(*) begin
        z = 1'b0;
        if (state == S2 && x == 1'b1)
            z = 1'b1;
    end
endmodule
```

考试写 FSM 的稳妥流程：

```text
题意 -> 状态含义 -> 状态图 -> 状态编码 -> 现态/次态表 -> Verilog
```

如果老师更偏传统数字电路，也可以把 `next_state` 的每一位看成 D 触发器输入：

```text
D1 = next_state[1]
D0 = next_state[0]
```

这和课程里“选择 D 触发器后，激励函数等于次态函数”完全一致。

---

## 17. testbench 入门

testbench 不综合成电路，只用于仿真。

### 17.1 半加器 testbench

```verilog
module tb_half_adder;
    reg A, B;
    wire S, CO;

    half_adder dut (
        .A(A),
        .B(B),
        .S(S),
        .CO(CO)
    );

    initial begin
        A = 0; B = 0; #10;
        A = 0; B = 1; #10;
        A = 1; B = 0; #10;
        A = 1; B = 1; #10;
        $finish;
    end
endmodule
```

### 17.2 时钟生成

```verilog
reg clk;

initial begin
    clk = 1'b0;
end

always #5 clk = ~clk;  // 周期 10 个时间单位
```

### 17.3 计数器 testbench

```verilog
module tb_counter_mod10;
    reg clk, rst;
    wire [3:0] q;

    counter_mod10 dut (
        .clk(clk),
        .rst(rst),
        .q(q)
    );

    initial clk = 1'b0;
    always #5 clk = ~clk;

    initial begin
        rst = 1'b1;
        #12;
        rst = 1'b0;
        #120;
        $finish;
    end
endmodule
```

考试如果只是写设计模块，testbench 多半不要求；但知道 testbench 能帮助理解 `initial`、`#5` 这些“不可综合”语句。

---

## 18. 哪些语句可综合，哪些只用于仿真

考试常见设计代码一般要求“可综合”。

| 写法 | 可综合？ | 说明 |
|---|---|---|
| `assign` | 通常可综合 | 组合逻辑 |
| `always @(*)` | 通常可综合 | 组合逻辑，别漏分支 |
| `always @(posedge clk)` | 通常可综合 | 触发器、寄存器 |
| `if / else` | 通常可综合 | 可能综合成 MUX 或控制逻辑 |
| `case` | 通常可综合 | 译码器、MUX、FSM |
| `initial` | 多用于仿真 | testbench 常用 |
| `#10` 延时 | 不用于综合设计 | testbench 常用 |
| `$display`、`$finish` | 不可综合 | 仿真系统任务 |

---

## 19. 从电路题翻译成 Verilog 的套路

### 19.1 组合逻辑题

题型：给真值表、逻辑表达式、功能描述、卡诺图、MUX/译码器连接。

流程：

```text
1. 确定输入输出
2. 写 module 端口
3. 写真值表或逻辑表达式
4. 能一行写清楚就用 assign
5. 分支多就用 always @(*) + case/if
6. 检查所有输出是否在所有分支赋值
```

模板：

```verilog
module comb_template (
    input  [N-1:0] a,
    input          sel,
    output reg     y
);
    always @(*) begin
        y = 1'b0;  // 默认值，防 latch
        case (sel)
            1'b0: y = ...;
            1'b1: y = ...;
            default: y = 1'b0;
        endcase
    end
endmodule
```

### 19.2 时序逻辑题

题型：触发器、寄存器、计数器、状态机。

流程：

```text
1. 找时钟 clk、复位 rst、输入、输出
2. 判断同步复位还是异步复位
3. 定义状态寄存器或计数寄存器
4. 在 always @(posedge clk) 中用 <= 更新
5. 如果是 FSM，拆成状态寄存器 + 次态逻辑 + 输出逻辑
6. 检查无效状态 default 是否能回到初态
```

模板：

```verilog
always @(posedge clk) begin
    if (rst)
        q <= INIT;
    else
        q <= q_next;
end
```

### 19.3 FSM 题

流程：

```text
题意
-> 状态含义
-> 状态图
-> 状态编码
-> next_state 逻辑
-> output 逻辑
-> Verilog 三段式
```

模板：

```verilog
parameter S0 = 2'b00, S1 = 2'b01, S2 = 2'b10;
reg [1:0] state, next_state;

always @(posedge clk) begin
    if (rst)
        state <= S0;
    else
        state <= next_state;
end

always @(*) begin
    next_state = S0;
    case (state)
        S0: next_state = ...;
        S1: next_state = ...;
        S2: next_state = ...;
        default: next_state = S0;
    endcase
end

always @(*) begin
    z = 1'b0;
    case (state)
        ...
    endcase
end
```

---

## 20. 常见易错点清单

### 20.1 语法易错

```text
module 后面端口列表要有分号
endmodule 不要漏
always、if、case 多语句要 begin/end
case 结束是 endcase，不是 end
位宽要匹配
常量写法是 4'b1010，不是 4b1010
```

### 20.2 逻辑易错

| 错误 | 后果 | 改法 |
|---|---|---|
| 组合逻辑漏 `else/default` | 生成 latch | 给默认值或补全分支 |
| 组合逻辑用 `<=` | 仿真和硬件理解混乱 | 用 `=` |
| 时序逻辑用 `=` | race condition | 用 `<=` |
| 多个 always 写同一个 reg | 多驱动 | 一个寄存器只在一个 always 中赋值 |
| 把 Verilog 当 C 语言 | 理解错误 | 想象成并行硬件 |
| 忽略高有效/低有效 | 输出全反 | 看清信号名和题目说明 |
| 忽略复位方式 | 行为不同 | 同步复位只写 clk，异步复位写 clk 和 rst |

### 20.3 `wire` 和 `reg` 易错

```verilog
output y;
always @(*) begin
    y = a & b;   // 错，y 不是 reg
end
```

改成：

```verilog
output reg y;
always @(*) begin
    y = a & b;
end
```

或者：

```verilog
output y;
assign y = a & b;
```

---

## 21. 考前最小背诵版

### 21.1 组合逻辑模板

```verilog
always @(*) begin
    y = 1'b0;
    case (sel)
        2'b00: y = a;
        2'b01: y = b;
        2'b10: y = c;
        2'b11: y = d;
        default: y = 1'b0;
    endcase
end
```

### 21.2 D 触发器模板

```verilog
always @(posedge clk) begin
    if (rst)
        q <= 1'b0;
    else
        q <= d;
end
```

### 21.3 异步低有效复位模板

```verilog
always @(posedge clk or negedge rst_n) begin
    if (!rst_n)
        q <= 1'b0;
    else
        q <= d;
end
```

### 21.4 计数器模板

```verilog
always @(posedge clk) begin
    if (rst)
        q <= 4'd0;
    else if (q == 4'd9)
        q <= 4'd0;
    else
        q <= q + 4'd1;
end
```

### 21.5 FSM 三段式模板

```verilog
always @(posedge clk) begin
    if (rst)
        state <= S0;
    else
        state <= next_state;
end

always @(*) begin
    next_state = S0;
    case (state)
        S0: next_state = ...;
        S1: next_state = ...;
        default: next_state = S0;
    endcase
end

always @(*) begin
    z = 1'b0;
    case (state)
        S0: z = ...;
        S1: z = ...;
        default: z = 1'b0;
    endcase
end
```

### 21.6 一句话规则

```text
assign 写简单组合逻辑
always @(*) 写复杂组合逻辑，用 =
always @(posedge clk) 写时序逻辑，用 <=
D 触发器最简单：D = next_state
case 必写 default
组合逻辑先给默认值防 latch
```

---

## 22. 建议刷题路线

只为考试，建议这样刷：

1. HDLBits Getting Started：熟悉提交环境
2. Verilog Language：Modules、Vectors、Always blocks
3. Combinational Logic：Basic gates、Multiplexers、K-maps、Arithmetic circuits
4. Sequential Logic：DFF、Counters、Shift registers、FSM
5. 自己把课程第 2、3 章典型电路改写成 Verilog

不要一开始就刷很难的 pipelining、memory、large FSM。考试大概率用不到。

---

## 23. 参考资料

这些资料用于交叉核对本笔记中的写法和规则：

1. [HDLBits — Verilog Practice](https://hdlbits.01xz.net/wiki/Main_Page)：在线 Verilog 练习，覆盖组合逻辑、时序逻辑、FSM、testbench。
2. [ChipVerify Verilog Tutorial](https://chipverify.com/tutorials/verilog)：适合入门理解 Verilog、module、常见错误。
3. [ChipVerify: Combinational Logic with always](https://chipverify.com/verilog/verilog-combinational-logic-always)：组合逻辑 `always`、阻塞赋值、防 latch。
4. [ChipVerify: Sequential Logic with always](https://chipverify.com/verilog/verilog-sequential-logic-always)：时序逻辑 `always @(posedge clk)`、非阻塞赋值、计数器。
5. [Nandland Verilog Tutorials](https://nandland.com/category/verilog-tutorials-and-examples/verilog-tutorials)：面向初学者的 Verilog 示例。
6. [Nandland: Blocking vs. Nonblocking in Verilog](https://nandland.com/blocking-vs-nonblocking-in-verilog)：解释 `=` 与 `<=`。
7. [University of Washington CSE 371 Verilog Tutorial PDF](https://courses.cs.washington.edu/courses/cse371/24sp/verilog/Verilog_Tutorial.pdf)：课程讲义，解释组合/时序 RTL 和 FSM。
8. [Clifford Cummings, Nonblocking Assignments in Verilog Synthesis](https://csg.csail.mit.edu/6.375/6_375_2009_www/papers/cummings-nonblocking-snug99.pdf)：经典 Verilog 编码风格论文，强调组合逻辑用 `=`、时序逻辑用 `<=` 等规则。


