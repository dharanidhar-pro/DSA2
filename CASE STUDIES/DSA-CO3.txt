import java.util.*;

class Edge implements Comparable<Edge> {
    String src, dest;
    int weight;

    Edge(String s, String d, int w) {
        src = s;
        dest = d;
        weight = w;
    }

    public int compareTo(Edge other) {
        return this.weight - other.weight;
    }
}

class KruskalMST {

    static Map<String, String> parent = new HashMap<>();

    static void makeSet(String vertex) {
        parent.put(vertex, vertex);
    }

    static String find(String vertex) {
        if (!parent.get(vertex).equals(vertex)) {
            parent.put(vertex, find(parent.get(vertex)));
        }
        return parent.get(vertex);
    }

    static void union(String v1, String v2) {
        String root1 = find(v1);
        String root2 = find(v2);

        if (!root1.equals(root2)) {
            parent.put(root1, root2);
        }
    }

    public static void main(String[] args) {

        String[] stations = {
            "DEL", "BPL", "MUM",
            "NGP", "CHN", "HYD"
        };

        for (String station : stations) {
            makeSet(station);
        }

        List<Edge> edges = new ArrayList<>();

        edges.add(new Edge("DEL", "BPL", 700));
        edges.add(new Edge("DEL", "MUM", 1400));
        edges.add(new Edge("BPL", "MUM", 800));
        edges.add(new Edge("BPL", "NGP", 350));
        edges.add(new Edge("MUM", "NGP", 850));
        edges.add(new Edge("NGP", "HYD", 500));
        edges.add(new Edge("NGP", "CHN", 1100));
        edges.add(new Edge("HYD", "CHN", 600));

        Collections.sort(edges);

        int totalCost = 0;

        System.out.println("Sorted Edges:");
        for (Edge e : edges) {
            System.out.println(e.src + " - " + e.dest + " : " + e.weight);
        }

        System.out.println("\nMST Edges:");

        for (Edge e : edges) {

            String root1 = find(e.src);
            String root2 = find(e.dest);

            if (!root1.equals(root2)) {

                System.out.println(
                    e.src + " - " + e.dest +
                    " : " + e.weight + " Accepted"
                );

                totalCost += e.weight;
                union(e.src, e.dest);
            } else {

                System.out.println(
                    e.src + " - " + e.dest +
                    " : " + e.weight + " Rejected"
                );
            }
        }

        System.out.println("\nTotal MST Cost: " + totalCost);
    }
}
